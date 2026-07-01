// resources/js/Pages/Documents/Show.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    ChevronLeft,
    Download,
    Eye,
    Calendar,
    User,
    FileText,
    CheckCircle,
    Archive,
    Users,
    UserPlus,
    Tag,
    Mail,
    BookOpen,
    File,
    Award,
    ExternalLink,
    Clock,
    Bookmark,
    BookmarkCheck,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';

interface Author {
    name: string;
    email: string | null;
    role: string;
}

interface SubmissionData {
    id: number;
    status: 'verified' | 'archived';
    submitted_at: string;
    verified_at: string | null;
    verification_notes: string | null;
}

interface DocumentData {
    id: number;
    title: string;
    abstract: string | null;
    description: string | null;
    file_path: string | null;
    file_name: string | null;
    file_size: string;
    mime_type: string | null;
    keywords: string[];
    authors: Author[];
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    reviewer: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface StudentData {
    id: number;
    name: string;
    email: string;
}

interface VerifiedByData {
    id: number;
    name: string;
    email: string;
}

interface DocumentShowProps {
    submission: SubmissionData;
    document: DocumentData;
    student: StudentData | null;
    verified_by: VerifiedByData | null;
    is_saved?: boolean;
}

const DocumentShow: React.FC<DocumentShowProps> = ({
    submission,
    document,
    student,
    verified_by,
    is_saved = false,
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaved, setIsSaved] = useState(is_saved);
    const [isTogglingSave, setIsTogglingSave] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'archived':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="h-5 w-5" />;
            case 'archived':
                return <Archive className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'archived':
                return 'Archived';
            default:
                return 'Unknown';
        }
    };

    const handleDownload = () => {
        setIsDownloading(true);

        // Simple approach - open in new tab or download
        window.open(`/documents/${submission.id}/download`, '_blank');

        setIsDownloading(false);
        toast.success('Download started');
    };

    const handleToggleSave = () => {
        setIsTogglingSave(true);

        router.post(
            '/saved-documents/toggle',
            {
                final_document_id: submission.id,
            },
            {
                onSuccess: () => {
                    setIsSaved(!isSaved);
                    toast.success(
                        isSaved
                            ? 'Document removed from saved collection'
                            : 'Document saved successfully',
                    );
                    setIsTogglingSave(false);
                },
                onError: () => {
                    toast.error('Failed to toggle save status');
                    setIsTogglingSave(false);
                },
            },
        );
    };

    const isPdf = document.mime_type === 'application/pdf';
    const fileUrl = document.file_path
        ? `/storage/${document.file_path}`
        : null;
    const mainAuthor = document.authors.find((a) => a.role === 'Main Author');
    const coAuthors = document.authors.filter((a) => a.role === 'Co-author');

    return (
        <AppLayout>
            <Head title={`${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-5xl px-4 py-8">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href="/documents"
                        className="inline-flex items-center gap-2 font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Repository
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Document Details
                                </span>
                                <span className="flex items-center gap-1 rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs text-[#D4AF37]">
                                    <Award className="h-3 w-3" />
                                    Final Paper
                                </span>
                            </div>
                            <h1 className="font-playfair text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                                {document.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Save Button */}
                            <Button
                                onClick={handleToggleSave}
                                disabled={isTogglingSave}
                                variant={isSaved ? 'default' : 'outline'}
                                className={
                                    isSaved
                                        ? 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]/80'
                                        : 'border-[#1A1A1A]/20 hover:border-[#D4AF37]'
                                }
                            >
                                {isSaved ? (
                                    <>
                                        <BookmarkCheck className="mr-2 h-4 w-4" />
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>

                            {/* Status Badge */}
                            <div
                                className={`flex items-center gap-2 rounded border px-3 py-1 font-sans text-sm ${getStatusBadge(submission.status)}`}
                            >
                                {getStatusIcon(submission.status)}
                                {getStatusLabel(submission.status)}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#6C6863]">
                        {student && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-sans">
                                    Submitted by: {student.name}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-sans">
                                Submitted: {submission.submitted_at}
                            </span>
                        </div>
                        {submission.verified_at && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-sans">
                                    Verified: {submission.verified_at}
                                </span>
                            </div>
                        )}
                        {document.file_name && (
                            <div className="flex items-center gap-2">
                                <File className="h-4 w-4" />
                                <span className="font-sans">
                                    {document.file_name} ({document.file_size})
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {fileUrl && (
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </Button>
                    )}

                    {isPdf && fileUrl && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center border border-[#1A1A1A] px-6 font-sans text-sm text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Document
                        </a>
                    )}

                    {verified_by && (
                        <div className="flex h-10 items-center px-4 font-sans text-sm text-[#6C6863]">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Verified by {verified_by.name}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Document Details */}
                    <div className="lg:col-span-2">
                        {/* Authors */}
                        {document.authors && document.authors.length > 0 && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-4 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <Users className="h-5 w-5 text-[#D4AF37]" />
                                    Authors
                                </h2>
                                {mainAuthor && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-[#D4AF37]" />
                                            <span className="font-sans font-medium text-[#1A1A1A]">
                                                {mainAuthor.name}
                                            </span>
                                            <span className="rounded bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] text-[#D4AF37]">
                                                Main Author
                                            </span>
                                        </div>
                                        {mainAuthor.email && (
                                            <div className="ml-6 flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-[#6C6863]" />
                                                <span className="font-sans text-xs text-[#6C6863]">
                                                    {mainAuthor.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {coAuthors.length > 0 && (
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <UserPlus className="h-4 w-4 text-[#6C6863]" />
                                            <span className="font-sans text-xs font-medium text-[#6C6863] uppercase">
                                                Co-authors ({coAuthors.length})
                                            </span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            {coAuthors.map((author, idx) => (
                                                <div key={idx}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-[#6C6863]" />
                                                        <span className="font-sans text-sm text-[#1A1A1A]">
                                                            {author.name}
                                                        </span>
                                                    </div>
                                                    {author.email && (
                                                        <div className="ml-5 flex items-center gap-2">
                                                            <Mail className="h-3 w-3 text-[#6C6863]" />
                                                            <span className="font-sans text-xs text-[#6C6863]">
                                                                {author.email}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Abstract */}
                        {document.abstract && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Abstract
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    {document.abstract}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {document.description && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Background of the Study
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    {document.description}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {document.keywords && document.keywords.length > 0 && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <Tag className="h-5 w-5 text-[#D4AF37]" />
                                    Keywords
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {document.keywords.map((keyword, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#1A1A1A]"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verification Notes */}
                        {submission.verification_notes && (
                            <div className="mb-8 border border-yellow-200 bg-yellow-50 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Verification Notes
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {submission.verification_notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                            <h3 className="font-playfair mb-4 text-lg text-[#1A1A1A]">
                                Document Info
                            </h3>

                            {/* File Info */}
                            {document.file_name && (
                                <div className="mb-4">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        File Details
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-sans text-[#1A1A1A]">
                                            {document.file_name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            Size: {document.file_size}
                                        </p>
                                        {document.mime_type && (
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                Type: {document.mime_type}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Student Info */}
                            {student && (
                                <div className="mb-4">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Submitted By
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-sans text-sm text-[#1A1A1A]">
                                            {student.name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {student.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reviewer Info */}
                            {document.reviewer && (
                                <div className="mb-4">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Reviewed By
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-sans text-sm text-[#1A1A1A]">
                                            {document.reviewer.name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {document.reviewer.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Verified By Info */}
                            {verified_by && (
                                <div className="mb-4">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Verified By
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-sans text-sm text-[#1A1A1A]">
                                            {verified_by.name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {verified_by.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div>
                                <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Dates
                                </div>
                                <div className="space-y-1 text-sm text-[#6C6863]">
                                    <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-1">
                                        <span>Submitted</span>
                                        <span className="text-[#1A1A1A]">
                                            {submission.submitted_at}
                                        </span>
                                    </div>
                                    {submission.verified_at && (
                                        <div className="flex justify-between">
                                            <span>Verified</span>
                                            <span className="text-[#1A1A1A]">
                                                {submission.verified_at}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default DocumentShow;
