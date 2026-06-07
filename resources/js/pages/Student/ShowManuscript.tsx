// resources/js/Pages/Documents/ShowManuscript.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import {
    FileText,
    Download,
    Eye,
    User,
    Calendar,
    Users,
    Award,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    MessageSquare,
    Maximize2,
    Minimize2,
    File,
    FileArchive,
    Image,
    Music,
    Video,
    Code,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InviteCollaboratorsModal from '@/components/ui/InviteCollaboratorsModal,';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ShowManuscriptProps {
    document: {
        id: number;
        title: string;
        abstract: string;
        description: string;
        keywords: string[];
        file_path: string;
        file_name: string;
        file_size: string;
        mime_type: string;
        status: string;
        status_label: string;
        status_color: string;
        views: number;
        downloads: number;
        citations: number;
        created_at: string;
        updated_at: string;
        submitted_at: string | null;
        reviewed_at: string | null;
        reviewer_feedback: string | null;
        is_public: boolean;
        is_featured: boolean;
    };
    author: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    reviewer: {
        id: number;
        name: string;
        email: string;
    } | null;
    collaborators: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        status: string;
    }>;
    pendingInvitations: Array<{
        id: number;
        email: string;
        role: string;
        expires_at: string;
    }>;
    userRole: 'owner' | 'co-author' | 'reviewer' | 'viewer';
    canEdit: boolean;
    canReview: boolean;
    similarDocuments: Array<{
        id: number;
        title: string;
        user: { name: string };
        created_at: string;
    }>;
    file_type?: string;
}

const ShowManuscript: React.FC<ShowManuscriptProps> = ({
    document,
    author,
    reviewer,
    collaborators,
    pendingInvitations,
    userRole,
    canEdit,
    canReview,
    similarDocuments,
}) => {
    const [isClient, setIsClient] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>(
        'approved',
    );
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // PDF pagination states
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const isPdf = document.mime_type === 'application/pdf';
    const isDocx =
        document.mime_type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isDoc = document.mime_type === 'application/msword';
    const isPreviewable = isPdf || isDocx || isDoc;

    const getFileIcon = () => {
        const mimeType = document.mime_type;
        const fileName = document.file_name.toLowerCase();

        // PDF
        if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return <FileText className="h-12 w-12 text-red-500" />;
        }
        // Word documents
        if (
            mimeType === 'application/msword' ||
            mimeType ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.doc') ||
            fileName.endsWith('.docx')
        ) {
            return <FileText className="h-12 w-12 text-blue-500" />;
        }
        // Images
        if (
            mimeType?.startsWith('image/') ||
            fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
        ) {
            return <Image className="h-12 w-12 text-green-500" />;
        }
        // Archives
        if (
            mimeType?.includes('zip') ||
            mimeType?.includes('rar') ||
            fileName.match(/\.(zip|rar|7z|tar|gz)$/)
        ) {
            return <FileArchive className="h-12 w-12 text-yellow-500" />;
        }
        // Audio
        if (
            mimeType?.startsWith('audio/') ||
            fileName.match(/\.(mp3|wav|ogg|m4a)$/)
        ) {
            return <Music className="h-12 w-12 text-purple-500" />;
        }
        // Video
        if (
            mimeType?.startsWith('video/') ||
            fileName.match(/\.(mp4|avi|mov|wmv|flv)$/)
        ) {
            return <Video className="h-12 w-12 text-pink-500" />;
        }
        // Text files
        if (
            mimeType?.startsWith('text/') ||
            fileName.match(/\.(txt|md|rtf)$/)
        ) {
            return <Code className="h-12 w-12 text-gray-500" />;
        }
        // Default
        return <File className="h-12 w-12 text-[#6C6863]" />;
    };

    // Update the getFileTypeDisplay function
    const getFileTypeDisplay = () => {
        const mimeType = document.mime_type;
        const fileName = document.file_name.toLowerCase();

        if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return 'PDF Document';
        }
        if (mimeType === 'application/msword' || fileName.endsWith('.doc')) {
            return 'Word Document (DOC)';
        }
        if (
            mimeType ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            return 'Word Document (DOCX)';
        }
        if (mimeType?.startsWith('image/')) {
            return 'Image File';
        }
        if (mimeType?.startsWith('text/') || fileName.endsWith('.txt')) {
            return 'Text File';
        }

        // Get extension from filename
        const extension = fileName.split('.').pop()?.toUpperCase();
        return extension ? `${extension} File` : 'Unknown File Type';
    };

    // Set isClient to true when component mounts (client-side only)
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Handle fullscreen change - only on client side
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            const handleFullscreenChange = () => {
                setIsFullscreen(
                    !!(
                        document.fullscreenElement ||
                        (document as any).webkitFullscreenElement ||
                        (document as any).mozFullScreenElement ||
                        (document as any).msFullscreenElement
                    ),
                );
            };
            window.document.addEventListener(
                'fullscreenchange',
                handleFullscreenChange,
            );

            return () =>
                window.document.removeEventListener(
                    'fullscreenchange',
                    handleFullscreenChange,
                );
        }
    }, [isClient]);

    const handlePreview = async () => {
        if (!isPreviewable) {
            toast.error('Preview not available for this file type');
            return;
        }

        setShowPreview(true);

        if (isPdf) {
            const fileUrl = `/storage/${document.file_path}`;
            setPdfFile(fileUrl);
            setPdfLoading(true);
            setPdfError(null);
            setPageNumber(1);
            setNumPages(null);
        } else if (isDocx || isDoc) {
            // For DOCX/DOC, use Google Docs Viewer
            const fileUrl = `/storage/${document.file_path}`;
            const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(window.location.origin + fileUrl)}`;
            window.open(googleViewerUrl, '_blank');
            toast.info('Opening document in new tab...');
            setShowPreview(false);
        }
    };

    const handleDownload = () => {
        router.get(
            `/student/documents/${document.id}/download`,
            {},
            {
                onSuccess: () => {
                    toast.success('Download started');
                },
                onError: () => {
                    toast.error('Failed to download file');
                },
            },
        );
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);

        router.post(
            `/documents/${document.id}/review`,
            {
                status: reviewStatus,
                feedback: reviewFeedback,
            },
            {
                onSuccess: () => {
                    toast.success(`Document ${reviewStatus} successfully`);
                    setShowReviewForm(false);
                    setSubmittingReview(false);
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to submit review');
                    setSubmittingReview(false);
                },
            },
        );
    };

    const toggleFullscreen = () => {
        const previewElement = document.getElementById('preview-container');
        if (!isFullscreen) {
            if (previewElement?.requestFullscreen) {
                previewElement.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPdfLoading(false);
        toast.success(`Loaded ${numPages} pages`);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF load error:', error);
        setPdfError('Failed to load PDF. Please try downloading the file.');
        setPdfLoading(false);
    };

    const goToPreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const goToNextPage = () => {
        if (numPages && pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const rotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const getStatusIcon = () => {
        switch (document.status) {
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'pending_review':
            case 'under_review':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            default:
                return <FileText className="h-5 w-5 text-[#6C6863]" />;
        }
    };

    const getStatusClass = () => {
        switch (document.status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending_review':
            case 'under_review':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    // Show loading on server side
    if (!isClient) {
        return (
            <AppLayout>
                <Head title={`${document.title} - ASC KnowledgeVault`} />
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                            <p className="font-sans text-sm text-[#6C6863]">
                                Loading document...
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-6xl">
                {/* Document Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-[#D4AF37]" />
                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                Manuscript
                            </span>
                        </div>
                        <span
                            className={`rounded border px-3 py-1 font-sans text-xs ${getStatusClass()}`}
                        >
                            <span className="flex items-center gap-1">
                                {getStatusIcon()}
                                {document.status_label}
                            </span>
                        </span>
                    </div>
                    <h1 className="font-playfair mb-4 text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                        {document.title}
                    </h1>

                    {/* Author info */}
                    <div className="mb-6 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#6C6863]" />
                            <span className="font-sans text-sm text-[#1A1A1A]">
                                {author.name}
                            </span>
                            {author.role === 'faculty' && (
                                <span className="text-xs text-[#D4AF37]">
                                    (Faculty)
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#6C6863]" />
                            <span className="font-sans text-sm text-[#6C6863]">
                                {document.created_at}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#6C6863]" />
                            <span className="font-sans text-sm text-[#6C6863]">
                                {document.views} views
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-[#6C6863]" />
                            <span className="font-sans text-sm text-[#6C6863]">
                                {document.downloads} downloads
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleDownload}
                            className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>

                        {isPreviewable && (
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {isPdf ? 'Read Online' : 'Preview Document'}
                            </Button>
                        )}

                        {(userRole === 'owner' || userRole === 'co-author') && (
                            <Button
                                variant="outline"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Invite Collaborators
                            </Button>
                        )}

                        {canReview && !document.reviewed_at && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowReviewForm(!showReviewForm)
                                }
                                className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Submit Review
                            </Button>
                        )}
                    </div>
                </div>

                {/* PDF Reader Modal with Pagination */}
                {showPreview && isPdf && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div
                            id="preview-container"
                            className={`relative bg-[#F9F8F6] ${isFullscreen ? 'fixed inset-0' : 'h-[90vh] w-full max-w-5xl'}`}
                        >
                            {/* Preview Header */}
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F8F6] p-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-red-500" />
                                    <div>
                                        <h3 className="font-playfair text-sm text-[#1A1A1A]">
                                            {document.title}
                                        </h3>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {document.file_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Zoom controls */}
                                    <button
                                        onClick={zoomOut}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs text-[#6C6863]">
                                        {Math.round(scale * 100)}%
                                    </span>
                                    <button
                                        onClick={zoomIn}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={rotate}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                        title="Rotate"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </button>
                                    <div className="mx-1 h-6 w-px bg-[#1A1A1A]/10" />
                                    <button
                                        onClick={toggleFullscreen}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                        title={
                                            isFullscreen
                                                ? 'Exit Fullscreen'
                                                : 'Fullscreen'
                                        }
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer */}
                            <div className="flex h-[calc(100%-60px)] flex-col items-center overflow-auto bg-gray-100 p-4">
                                {pdfLoading && (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                                            <p className="font-sans text-sm text-[#6C6863]">
                                                Loading PDF...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {pdfError && (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="max-w-md text-center">
                                            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                                            <p className="font-sans text-sm text-red-600">
                                                {pdfError}
                                            </p>
                                            <Button
                                                onClick={handleDownload}
                                                className="mt-4"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download PDF Instead
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {pdfFile && !pdfError && (
                                    <>
                                        <PDFDocument
                                            file={pdfFile}
                                            onLoadSuccess={
                                                onDocumentLoadSuccess
                                            }
                                            onLoadError={onDocumentLoadError}
                                            loading={
                                                <div className="flex items-center justify-center py-20">
                                                    <div className="text-center">
                                                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                                                        <p className="font-sans text-sm text-[#6C6863]">
                                                            Loading pages...
                                                        </p>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <PDFPage
                                                pageNumber={pageNumber}
                                                scale={scale}
                                                rotate={rotation}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                className="shadow-lg"
                                            />
                                        </PDFDocument>

                                        {/* Pagination Controls */}
                                        {numPages && numPages > 1 && (
                                            <div className="mt-4 flex items-center gap-4 border border-[#1A1A1A]/10 bg-white p-3">
                                                <button
                                                    onClick={goToPreviousPage}
                                                    disabled={pageNumber <= 1}
                                                    className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="font-sans text-sm text-[#1A1A1A]">
                                                    Page {pageNumber} of{' '}
                                                    {numPages}
                                                </span>
                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={
                                                        pageNumber >= numPages
                                                    }
                                                    className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                    <div className="mb-8 border border-yellow-200 bg-yellow-50 p-6">
                        <h3 className="font-playfair mb-4 text-xl text-[#1A1A1A]">
                            Submit Review
                        </h3>
                        <form
                            onSubmit={handleSubmitReview}
                            className="space-y-4"
                        >
                            <div>
                                <Label className="mb-2 block">Decision *</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="approved"
                                            checked={
                                                reviewStatus === 'approved'
                                            }
                                            onChange={() =>
                                                setReviewStatus('approved')
                                            }
                                            className="h-4 w-4 text-green-600"
                                        />
                                        <span className="font-sans text-sm text-green-700">
                                            Approve
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="rejected"
                                            checked={
                                                reviewStatus === 'rejected'
                                            }
                                            onChange={() =>
                                                setReviewStatus('rejected')
                                            }
                                            className="h-4 w-4 text-red-600"
                                        />
                                        <span className="font-sans text-sm text-red-700">
                                            Reject
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="feedback"
                                    className="mb-2 block"
                                >
                                    Feedback / Comments *
                                </Label>
                                <Textarea
                                    id="feedback"
                                    value={reviewFeedback}
                                    onChange={(e) =>
                                        setReviewFeedback(e.target.value)
                                    }
                                    placeholder="Provide your review comments here..."
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {submittingReview
                                        ? 'Submitting...'
                                        : 'Submit Review'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReviewForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Main Content - Two Column Layout */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column - Document Content */}
                    <div className="lg:col-span-8">
                        {/* File Info Card */}
                        <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                            <div className="flex items-center gap-4">
                                {getFileIcon()}
                                <div className="flex-1">
                                    <h3 className="font-playfair text-lg text-[#1A1A1A]">
                                        File Information
                                    </h3>
                                    <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                        {document.file_name}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#6C6863]">
                                        <span>
                                            📄 Size: {document.file_size}
                                        </span>
                                        <span>
                                            📁 Type: {getFileTypeDisplay()}
                                        </span>
                                        {document.mime_type &&
                                            document.mime_type !==
                                                'application/octet-stream' && (
                                                <span>
                                                    🔧 MIME:{' '}
                                                    {document.mime_type}
                                                </span>
                                            )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handlePreview}
                                    className="shrink-0"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {isPdf ? 'Read Online' : 'Preview'}
                                </Button>
                            </div>
                        </div>

                        {/* Abstract */}
                        {document.abstract && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Abstract
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.abstract}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {document.description && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Description
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.description}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {document.keywords && document.keywords.length > 0 && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Keywords
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {document.keywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#1A1A1A]"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Feedback */}
                        {document.reviewer_feedback && (
                            <div className="mb-8 border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                                    Reviewer Feedback
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.reviewer_feedback}
                                </p>
                                {document.reviewed_at && (
                                    <p className="mt-3 text-xs text-[#6C6863]">
                                        Reviewed on {document.reviewed_at}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4">
                        {/* Document Info */}
                        <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                            <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                Document Info
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#6C6863]">
                                        File Name
                                    </span>
                                    <span className="max-w-[150px] truncate text-[#1A1A1A]">
                                        {document.file_name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6C6863]">
                                        File Size
                                    </span>
                                    <span className="text-[#1A1A1A]">
                                        {document.file_size}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6C6863]">
                                        Citations
                                    </span>
                                    <span className="text-[#D4AF37]">
                                        {document.citations}
                                    </span>
                                </div>
                                {document.submitted_at && (
                                    <div className="flex justify-between">
                                        <span className="text-[#6C6863]">
                                            Submitted
                                        </span>
                                        <span className="text-[#1A1A1A]">
                                            {document.submitted_at}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contributors */}
                        {(collaborators.length > 0 || reviewer) && (
                            <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                                <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                    Contributors
                                </h3>

                                {/* Primary Author */}
                                <div className="mb-3 border-b border-[#1A1A1A]/10 pb-2">
                                    <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                        Primary Author
                                    </p>
                                    <p className="font-sans text-sm text-[#6C6863]">
                                        {author.name}
                                    </p>
                                </div>

                                {/* Co-authors */}
                                {collaborators.filter(
                                    (c) => c.role === 'co-author',
                                ).length > 0 && (
                                    <div className="mb-3 border-b border-[#1A1A1A]/10 pb-2">
                                        <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                            Co-authors
                                        </p>
                                        {collaborators
                                            .filter(
                                                (c) => c.role === 'co-author',
                                            )
                                            .map((collab) => (
                                                <div
                                                    key={collab.id}
                                                    className="mt-1"
                                                >
                                                    <p className="font-sans text-sm text-[#6C6863]">
                                                        {collab.name}
                                                    </p>
                                                    <p className="font-sans text-xs text-[#6C6863]">
                                                        {collab.email}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Reviewer */}
                                {reviewer && (
                                    <div>
                                        <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                            Reviewer
                                        </p>
                                        <p className="font-sans text-sm text-[#6C6863]">
                                            {reviewer.name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {reviewer.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Similar Documents */}
                        {similarDocuments.length > 0 && (
                            <div className="border border-[#1A1A1A]/10 p-5">
                                <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                    Similar Documents
                                </h3>
                                <div className="space-y-3">
                                    {similarDocuments.map((doc) => (
                                        <Link
                                            key={doc.id}
                                            href={`/documents/${doc.id}`}
                                            className="group block border-b border-[#1A1A1A]/10 pb-2 last:border-0"
                                        >
                                            <p className="font-sans text-sm text-[#1A1A1A] transition-colors group-hover:text-[#D4AF37]">
                                                {doc.title}
                                            </p>
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                {doc.user.name}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Invite Collaborators Modal */}
            <InviteCollaboratorsModal
                documentId={document.id}
                documentTitle={document.title}
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onInviteSent={() => {
                    window.location.reload();
                }}
            />
        </AppLayout>
    );
};

export default ShowManuscript;
