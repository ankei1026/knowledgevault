// resources/js/Pages/Faculty/ReviewDetail.tsx

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Download,
    User,
    Mail,
    Calendar,
    Tag,
    CheckCircle,
    XCircle,
    Send,
    Eye,
    AlertCircle,
    Users,
    UserPlus,
    MessageSquare,
    Bell,
    MailOpen,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Author {
    name: string;
    email: string | null;
    role: string;
}

interface Invitation {
    id: number;
    email: string;
    message: string | null;
    role: string;
    status: string;
    created_at: string;
    inviter: {
        id: number;
        name: string;
        email: string;
    };
}

interface ReviewDetailProps {
    document: {
        id: number;
        title: string;
        abstract: string | null;
        description: string | null;
        keywords: string[] | null;
        file_path: string;
        file_name: string;
        file_size: string;
        mime_type: string;
        status: string;
        submitted_at: string;
        user_id: number;
    };
    authors: Author[];
    invitation?: Invitation | null;
    flash?: {
        success?: string;
        error?: string;
    };
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({
    document,
    authors,
    invitation = null,
    flash,
}) => {
    const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>(
        'approved',
    );
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showInvitation, setShowInvitation] = useState(true);

    const handleDownload = () => {
        router.get(
            `/documents/${document.id}/download`,
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

        if (!feedback.trim()) {
            toast.error('Please provide feedback for the author');
            return;
        }

        if (feedback.trim().length < 10) {
            toast.error('Please provide at least 10 characters of feedback');
            return;
        }

        setSubmitting(true);

        router.post(
            `/faculty/review/${document.id}`,
            {
                status: reviewStatus,
                feedback: feedback,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Document ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
                    );
                    setSubmitting(false);
                },
                onError: (error) => {
                    toast.error('Failed to submit review. Please try again.');
                    setSubmitting(false);
                },
            },
        );
    };

    const isPdf = document.mime_type === 'application/pdf';
    const fileUrl = `/storage/${document.file_path}`;
    const mainAuthor = authors.find((a) => a.role === 'Main Author');
    const coAuthors = authors.filter((a) => a.role === 'Co-author');

    return (
        <AppLayout>
            <Head title={`Review: ${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-6xl">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="font-sans text-sm text-green-700">
                            {flash.success}
                        </p>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="font-sans text-sm text-red-700">
                            {flash.error}
                        </p>
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Manuscript Review
                        </span>
                        {invitation && (
                            <span className="flex items-center gap-1 rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs text-[#D4AF37]">
                                <MailOpen className="h-3 w-3" />
                                Invited
                            </span>
                        )}
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        {document.title}
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Review this manuscript and provide feedback to the
                        authors.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column - Document Details */}
                    <div className="lg:col-span-7">
                        {/* Authors Info */}
                        <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                            <h3 className="font-playfair mb-3 flex items-center gap-2 text-lg text-[#1A1A1A]">
                                <Users className="h-5 w-5 text-[#D4AF37]" />
                                Authors
                            </h3>

                            {/* Main Author */}
                            {mainAuthor && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-[#D4AF37]" />
                                        <span className="font-sans text-sm font-medium text-[#1A1A1A]">
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

                            {/* Co-authors */}
                            {coAuthors.length > 0 && (
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 text-[#6C6863]" />
                                        <span className="font-sans text-xs font-medium text-[#6C6863] uppercase">
                                            Co-authors
                                        </span>
                                        <span className="text-xs text-[#6C6863]">
                                            ({coAuthors.length})
                                        </span>
                                    </div>
                                    <div className="ml-6 space-y-2">
                                        {coAuthors.map((author, index) => (
                                            <div key={index}>
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

                            {/* Submitted Date */}
                            <div className="mt-3 flex items-center gap-2 border-t border-[#1A1A1A]/10 pt-3">
                                <Calendar className="h-4 w-4 text-[#6C6863]" />
                                <span className="font-sans text-sm text-[#1A1A1A]">
                                    Submitted: {document.submitted_at}
                                </span>
                            </div>

                            {/* Invitation Info */}
                            {invitation && (
                                <div className="mt-3 flex items-center gap-2 border-t border-[#1A1A1A]/10 pt-3">
                                    <Bell className="h-4 w-4 text-[#D4AF37]" />
                                    <span className="font-sans text-sm text-[#6C6863]">
                                        {invitation.role === 'co-author'
                                            ? 'You were invited as a co-author'
                                            : 'You were invited as a reviewer'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Abstract */}
                        {document.abstract && (
                            <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                                <h3 className="font-playfair mb-2 text-lg text-[#1A1A1A]">
                                    Abstract
                                </h3>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.abstract}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {document.description && (
                            <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                                <h3 className="font-playfair mb-2 text-lg text-[#1A1A1A]">
                                    Description
                                </h3>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.description}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {document.keywords && document.keywords.length > 0 && (
                            <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                                <h3 className="font-playfair mb-2 text-lg text-[#1A1A1A]">
                                    Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {document.keywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 text-xs text-[#1A1A1A]"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invitation Message - New Section */}
                        {invitation && invitation.message && showInvitation && (
                            <div className="mb-8 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                                            <span className="font-sans text-xs font-medium tracking-[0.2em] text-[#D4AF37] uppercase">
                                                Message
                                            </span>
                                            <span className="ml-2 text-xs text-[#6C6863]">
                                                From{' '}
                                                {invitation.inviter?.name ||
                                                    'Student'}
                                            </span>
                                        </div>
                                        <div className="rounded border border-[#1A1A1A]/10 bg-white p-4">
                                            <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                                {invitation.message}
                                            </p>
                                            <div className="mt-3 flex items-center gap-4 text-xs text-[#6C6863]">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {invitation.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Sent:{' '}
                                                    {new Date(
                                                        invitation.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowInvitation(false)}
                                        className="ml-4 text-[#6C6863] transition-colors hover:text-[#1A1A1A]"
                                        title="Hide invitation message"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Review Actions */}
                    <div className="lg:col-span-5">
                        {/* File Preview */}
                        <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                            <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                Manuscript File
                            </h3>
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-red-500" />
                                <div className="flex-1">
                                    <p className="font-sans text-sm text-[#1A1A1A]">
                                        {document.file_name}
                                    </p>
                                    <p className="font-sans text-xs text-[#6C6863]">
                                        {document.file_size}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDownload}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Download className="mr-1 h-4 w-4" />
                                    Download
                                </Button>
                            </div>

                            {isPdf && (
                                <div className="mt-4">
                                    <Button
                                        onClick={() =>
                                            window.open(fileUrl, '_blank')
                                        }
                                        className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview Document
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="border border-[#1A1A1A]/10 p-5">
                            <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                Review Decision
                            </h3>

                            <form
                                onSubmit={handleSubmitReview}
                                className="space-y-4"
                            >
                                <div>
                                    <Label className="mb-2 block">
                                        Decision *
                                    </Label>
                                    <div className="flex gap-4">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                value="approved"
                                                checked={
                                                    reviewStatus === 'approved'
                                                }
                                                onChange={() =>
                                                    setReviewStatus('approved')
                                                }
                                                className="h-4 w-4 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="font-sans text-sm text-green-700">
                                                <CheckCircle className="mr-1 inline h-4 w-4" />
                                                Approve
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                value="rejected"
                                                checked={
                                                    reviewStatus === 'rejected'
                                                }
                                                onChange={() =>
                                                    setReviewStatus('rejected')
                                                }
                                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                                            />
                                            <span className="font-sans text-sm text-red-700">
                                                <XCircle className="mr-1 inline h-4 w-4" />
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
                                        value={feedback}
                                        onChange={(e) =>
                                            setFeedback(e.target.value)
                                        }
                                        placeholder="Provide detailed feedback to the authors. Include specific suggestions for improvement if rejecting..."
                                        rows={8}
                                        required
                                        className="resize-none"
                                    />
                                    <div className="mt-1 flex justify-between text-xs text-[#6C6863]">
                                        <span>
                                            Minimum 10 characters required
                                        </span>
                                        <span>
                                            {feedback.length} / 5000 characters
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {submitting
                                            ? 'Submitting...'
                                            : 'Submit Review'}
                                    </Button>
                                </div>
                            </form>

                            {/* Status indicator */}
                            <div className="mt-4 rounded border border-[#1A1A1A]/10 bg-[#F9F8F6] p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-[#6C6863]" />
                                        <span className="font-sans text-xs text-[#6C6863]">
                                            Review Status:
                                        </span>
                                    </div>
                                    <span
                                        className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                                            reviewStatus === 'approved'
                                                ? 'border border-green-200 bg-green-50 text-green-600'
                                                : 'border border-red-200 bg-red-50 text-red-600'
                                        }`}
                                    >
                                        {reviewStatus === 'approved' ? (
                                            <CheckCircle className="h-3 w-3" />
                                        ) : (
                                            <XCircle className="h-3 w-3" />
                                        )}
                                        {reviewStatus === 'approved'
                                            ? 'Will be Approved'
                                            : 'Will be Rejected'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Review Guidelines */}
                        <div className="mt-6 border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                    <p className="font-sans text-sm font-medium text-blue-800">
                                        Review Guidelines
                                    </p>
                                    <ul className="mt-1 space-y-1 font-sans text-xs text-blue-700">
                                        <li>• Provide constructive feedback</li>
                                        <li>
                                            • Be specific about strengths and
                                            weaknesses
                                        </li>
                                        <li>
                                            • Suggest improvements where
                                            applicable
                                        </li>
                                        <li>
                                            • Ensure your feedback is
                                            professional and respectful
                                        </li>
                                        <li>
                                            • Feedback is shared with all
                                            authors
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ReviewDetail;
