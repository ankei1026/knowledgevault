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
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    author: {
        id: number;
        name: string;
        email: string;
    };
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ document, author }) => {
    const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>(
        'approved',
    );
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
                    toast.error(error.message || 'Failed to submit review');
                    setSubmitting(false);
                },
            },
        );
    };

    const isPdf = document.mime_type === 'application/pdf';
    const fileUrl = `/storage/${document.file_path}`;

    return (
        <AppLayout>
            <Head title={`Review: ${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Manuscript Review
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        {document.title}
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Review this manuscript and provide feedback to the
                        author.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column - Document Details */}
                    <div className="lg:col-span-7">
                        {/* Author Info */}
                        <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                            <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                Author Information
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#6C6863]" />
                                    <span className="font-sans text-sm text-[#1A1A1A]">
                                        {author.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-[#6C6863]" />
                                    <span className="font-sans text-sm text-[#1A1A1A]">
                                        {author.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[#6C6863]" />
                                    <span className="font-sans text-sm text-[#1A1A1A]">
                                        Submitted: {document.submitted_at}
                                    </span>
                                </div>
                            </div>
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
                                        placeholder="Provide detailed feedback to the author. Include specific suggestions for improvement if rejecting..."
                                        rows={8}
                                        required
                                        className="resize-none"
                                    />
                                    <p className="mt-1 text-right text-xs text-[#6C6863]">
                                        {feedback.length} / 5000 characters
                                    </p>
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
