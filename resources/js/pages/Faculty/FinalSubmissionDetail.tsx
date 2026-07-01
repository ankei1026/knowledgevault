// resources/js/Pages/Faculty/FinalSubmissionDetail.tsx

import React, { useState } from 'react';
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
    Clock,
    Archive,
    MessageSquare,
    Award,
    ExternalLink,
    Users,
    UserPlus,
    Tag,
    Mail,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Author {
    name: string;
    email: string | null;
    role: string;
}

interface SubmissionData {
    id: number;
    status: 'pending' | 'verified' | 'archived';
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

interface FinalSubmissionDetailProps {
    submission: SubmissionData;
    document: DocumentData;
    student: StudentData | null;
    verified_by: VerifiedByData | null;
}

const FinalSubmissionDetail: React.FC<FinalSubmissionDetailProps> = ({
    submission,
    document,
    student,
    verified_by,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState(
        submission.verification_notes || '',
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'archived':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="h-5 w-5" />;
            case 'archived':
                return <Archive className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'archived':
                return 'Archived';
            default:
                return 'Pending Verification';
        }
    };

    const handleVerify = (status: 'verified' | 'archived') => {
        if (!verificationNotes.trim() && status === 'verified') {
            if (!confirm('No verification notes provided. Continue?')) {
                return;
            }
        }

        setIsSubmitting(true);

        router.post(
            `/faculty/final-submissions/${submission.id}/verify`,
            {
                status: status,
                verification_notes: verificationNotes.trim() || null,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Final submission ${status === 'verified' ? 'verified' : 'archived'} successfully!`,
                    );
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error(
                        'Failed to process submission. Please try again.',
                    );
                    setIsSubmitting(false);
                },
            },
        );
    };

    const canVerify = submission.status === 'pending';
    const mainAuthor = document.authors.find((a) => a.role === 'Main Author');
    const coAuthors = document.authors.filter((a) => a.role === 'Co-author');
    const isPdf = document.mime_type === 'application/pdf';
    const fileUrl = document.file_path
        ? `/storage/${document.file_path}`
        : null;

    return (
        <AppLayout>
            <Head title={`Final Submission - ${document.title}`} />

            <div className="mx-auto max-w-5xl">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href="/faculty/final-submissions"
                        className="inline-flex items-center gap-2 font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Final Submissions
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Final Submission
                                </span>
                                <span className="ml-2 flex items-center gap-1 rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs text-[#D4AF37]">
                                    <Award className="h-3 w-3" />
                                    Final Paper
                                </span>
                            </div>
                            <h1 className="font-playfair text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl">
                                {document.title}
                            </h1>
                        </div>
                        <div
                            className={`flex items-center gap-2 rounded border px-3 py-1 font-sans text-sm ${getStatusBadge(submission.status)}`}
                        >
                            {getStatusIcon(submission.status)}
                            {getStatusLabel(submission.status)}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#6C6863]">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-sans">
                                Student: {student?.name || 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-sans">
                                Submitted: {submission.submitted_at}
                            </span>
                        </div>
                        {document.file_name && (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-sans">
                                    {document.file_name} ({document.file_size})
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-10 flex flex-wrap gap-3">
                    {fileUrl && (
                        <a
                            href={`/faculty/final-submissions/${submission.id}/download`}
                            className="flex h-11 items-center border border-[#1A1A1A] px-6 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                        </a>
                    )}

                    {isPdf && fileUrl && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-11 items-center border border-[#1A1A1A] px-6 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </a>
                    )}

                    {canVerify && (
                        <>
                            <button
                                onClick={() => handleVerify('verified')}
                                disabled={isSubmitting}
                                className="group relative h-11 overflow-hidden bg-green-600 px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] disabled:opacity-50"
                            >
                                <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                <span className="relative z-10 flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                    <CheckCircle className="h-4 w-4" />
                                    {isSubmitting
                                        ? 'Processing...'
                                        : 'Verify Submission'}
                                </span>
                            </button>

                            {/* <button
                                onClick={() => handleVerify('archived')}
                                disabled={isSubmitting}
                                className="flex h-11 items-center border border-blue-600 px-6 font-sans text-[11px] tracking-[0.2em] text-blue-600 uppercase transition-all duration-500 hover:bg-blue-600 hover:text-white disabled:opacity-50"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Processing...' : 'Archive'}
                            </button> */}
                        </>
                    )}

                    {verified_by && (
                        <div className="flex h-11 items-center px-6 font-sans text-sm text-[#6C6863]">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Verified by {verified_by.name} on{' '}
                            {submission.verified_at}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {/* Authors */}
                        {document.authors && document.authors.length > 0 && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <Users className="h-5 w-5 text-[#D4AF37]" />
                                    Authors
                                </h2>
                                {mainAuthor && (
                                    <div className="mb-3">
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
                                    Description
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
                        {canVerify && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                                    Verification Notes
                                </h2>
                                <Textarea
                                    value={verificationNotes}
                                    onChange={(e) =>
                                        setVerificationNotes(e.target.value)
                                    }
                                    placeholder="Add notes about the verification process (optional)"
                                    rows={4}
                                    className="w-full"
                                    disabled={!canVerify}
                                />
                                <p className="mt-2 font-sans text-xs text-[#6C6863]">
                                    These notes will be stored with the
                                    submission record.
                                </p>
                            </div>
                        )}

                        {submission.verification_notes && !canVerify && (
                            <div className="mb-8 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <MessageSquare className="h-5 w-5 text-[#6C6863]" />
                                    Verification Notes
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    {submission.verification_notes}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="sticky top-8 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                            <h3 className="font-playfair mb-4 text-lg text-[#1A1A1A]">
                                Submission Info
                            </h3>

                            {/* Student Info */}
                            {student && (
                                <div className="mb-4">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Student
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

export default FinalSubmissionDetail;
