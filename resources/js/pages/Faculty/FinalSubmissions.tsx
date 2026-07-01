// resources/js/Pages/Faculty/FinalSubmissions.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Search,
    Eye,
    Download,
    CheckCircle,
    Clock,
    Archive,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Award,
    Tag,
    Users,
    UserPlus,
    ExternalLink,
    File,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface Author {
    name: string;
    email: string | null;
    role: string;
}

interface FinalSubmission {
    id: number;
    status: 'pending' | 'verified' | 'archived';
    submitted_at: string;
    verified_at: string | null;
    verification_notes: string | null;
    file_path: string;
    file_name: string;
    file_size: number;
    file_preview_url: string | null;
    abstract: string | null;
    keywords: string[];
    all_authors: Author[];
    student: {
        id: number;
        name: string;
        email: string;
    };
    document: {
        id: number;
        title: string;
        abstract: string | null;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    verified_by: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface FinalSubmissionsProps {
    submissions: {
        data: FinalSubmission[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        pending: number;
        verified: number;
        archived: number;
    };
    filters: {
        status: string;
        search: string;
    };
}

const FinalSubmissions: React.FC<FinalSubmissionsProps> = ({
    submissions,
    stats,
    filters: initialFilters,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        initialFilters.status || 'all',
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedSubmission, setExpandedSubmission] = useState<number | null>(
        null,
    );

    // Alert Dialog states
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [alertDialogType, setAlertDialogType] = useState<
        'verify' | 'archive'
    >('verify');
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<
        number | null
    >(null);
    const [verificationNotes, setVerificationNotes] = useState('');

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
                return <CheckCircle className="h-3 w-3" />;
            case 'archived':
                return <Archive className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
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

    const applyFilters = () => {
        router.get(
            '/faculty/final-submissions',
            {
                search: searchTerm,
                status: statusFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        router.get('/faculty/final-submissions', {}, { preserveState: true });
    };

    const openVerifyDialog = (id: number, type: 'verify' | 'archive') => {
        setSelectedSubmissionId(id);
        setAlertDialogType(type);
        setVerificationNotes('');
        setAlertDialogOpen(true);
    };

    const handleVerify = () => {
        if (!selectedSubmissionId) return;

        setIsSubmitting(true);

        router.post(
            `/faculty/final-submissions/${selectedSubmissionId}/verify`,
            {
                status: alertDialogType === 'verify' ? 'verified' : 'archived',
                verification_notes: verificationNotes.trim() || null,
            },
            {
                onSuccess: () => {
                    const action =
                        alertDialogType === 'verify' ? 'verified' : 'archived';
                    toast.success(`Final submission ${action} successfully!`);
                    setIsSubmitting(false);
                    setAlertDialogOpen(false);
                    setSelectedSubmissionId(null);
                    setVerificationNotes('');
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

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const isPdf = (submission: FinalSubmission) => {
        return submission.file_name?.toLowerCase().endsWith('.pdf');
    };

    const statCards = [
        {
            label: 'Total Submissions',
            value: stats.total,
            icon: FileText,
            color: '#1A1A1A',
        },
        {
            label: 'Pending Verification',
            value: stats.pending,
            icon: Clock,
            color: '#E67E22',
        },
        {
            label: 'Verified',
            value: stats.verified,
            icon: CheckCircle,
            color: '#10B981',
        },
        {
            label: 'Archived',
            value: stats.archived,
            icon: Archive,
            color: '#3B82F6',
        },
    ];

    const getDialogContent = () => {
        if (alertDialogType === 'verify') {
            return {
                title: 'Verify Final Submission',
                description:
                    'Are you sure you want to verify this final submission? This will publish the document to the repository.',
                actionText: 'Verify',
                actionClassName: 'bg-green-600 hover:bg-green-700 text-white',
                icon: <CheckCircle className="h-6 w-6 text-green-600" />,
            };
        } else {
            return {
                title: 'Archive Final Submission',
                description:
                    'Are you sure you want to archive this final submission? The document will not be published.',
                actionText: 'Archive',
                actionClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
                icon: <Archive className="h-6 w-6 text-blue-600" />,
            };
        }
    };

    const dialogContent = getDialogContent();

    return (
        <AppLayout>
            <Head title="Final Submissions - ASC KnowledgeVault" />

            <div className="mb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Faculty Review
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Final Submissions
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Review and verify final paper submissions from students.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="border-t-2 pt-3 transition-all duration-700 hover:bg-[#F9F8F6]/50"
                                style={{ borderTopColor: card.color }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            {card.label}
                                        </p>
                                        <p className="font-playfair text-2xl text-[#1A1A1A] lg:text-3xl">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className="border border-[#1A1A1A]/10 p-2 transition-all duration-500">
                                        <Icon className="h-4 w-4 text-[#6C6863]" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            placeholder="Search by title, student name, or email..."
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={applyFilters}
                        className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                    >
                        Apply
                    </Button>

                    <Button variant="outline" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    {submissions.data.map((submission) => (
                        <div
                            key={submission.id}
                            className="border border-[#1A1A1A]/10 bg-white transition-all hover:border-[#D4AF37] hover:shadow-sm"
                        >
                            {/* Header - Click to expand */}
                            <div
                                className="cursor-pointer p-5 transition-colors hover:bg-[#F9F8F6]/50"
                                onClick={() =>
                                    setExpandedSubmission(
                                        expandedSubmission === submission.id
                                            ? null
                                            : submission.id,
                                    )
                                }
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-[#6C6863]" />
                                            <h3 className="font-playfair text-lg text-[#1A1A1A]">
                                                {submission.document.title}
                                            </h3>
                                        </div>

                                        <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-[#6C6863]">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {submission.student.name}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Submitted:{' '}
                                                {new Date(
                                                    submission.submitted_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Keywords preview */}
                                        {submission.keywords &&
                                            submission.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {submission.keywords
                                                        .slice(0, 3)
                                                        .map((keyword, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs text-[#D4AF37]"
                                                            >
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    {submission.keywords
                                                        .length > 3 && (
                                                        <span className="text-xs text-[#6C6863]">
                                                            +
                                                            {submission.keywords
                                                                .length -
                                                                3}{' '}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span
                                            className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${getStatusBadge(submission.status)}`}
                                        >
                                            {getStatusIcon(submission.status)}
                                            {getStatusLabel(submission.status)}
                                        </span>

                                        <div className="flex flex-wrap justify-end gap-2">
                                            {submission.file_preview_url && (
                                                <a
                                                    href={
                                                        submission.file_preview_url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                    title="Preview document"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    Preview
                                                </a>
                                            )}
                                            <a
                                                href={`/faculty/final-submissions/${submission.id}/download`}
                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                title="Download file"
                                            >
                                                <Download className="h-3 w-3" />
                                                Download
                                            </a>

                                            <Link
                                                href={`/faculty/final-submissions/${submission.id}`}
                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                title="View details"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View
                                            </Link>

                                            {submission.status ===
                                                'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openVerifyDialog(
                                                                submission.id,
                                                                'verify',
                                                            );
                                                        }}
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-xs text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50"
                                                        title="Verify submission"
                                                    >
                                                        <CheckCircle className="h-3 w-3" />
                                                        Verify
                                                    </button>
                                                    {/* <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openVerifyDialog(
                                                                submission.id,
                                                                'archive',
                                                            );
                                                        }}
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50"
                                                        title="Archive submission"
                                                    >
                                                        <Archive className="h-3 w-3" />
                                                        Archive
                                                    </button> */}
                                                </>
                                            )}

                                            {submission.verified_by && (
                                                <span className="text-xs text-[#6C6863]">
                                                    Verified by:{' '}
                                                    {
                                                        submission.verified_by
                                                            .name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedSubmission === submission.id && (
                                <div className="border-t border-[#1A1A1A]/10 bg-[#F9F8F6] p-5">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Left Column - Document Details */}
                                        <div>
                                            {/* Authors */}
                                            {submission.all_authors &&
                                                submission.all_authors.length >
                                                    0 && (
                                                    <div className="mb-4">
                                                        <h4 className="mb-2 flex items-center gap-2 font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                            <Users className="h-4 w-4 text-[#D4AF37]" />
                                                            Authors
                                                        </h4>
                                                        <div className="space-y-1">
                                                            {submission.all_authors.map(
                                                                (
                                                                    author,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <User className="h-3 w-3 text-[#6C6863]" />
                                                                        <span className="text-[#1A1A1A]">
                                                                            {
                                                                                author.name
                                                                            }
                                                                            {author.role ===
                                                                                'Main Author' && (
                                                                                <span className="ml-1 text-[10px] text-[#D4AF37]">
                                                                                    (Main)
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Abstract */}
                                            {submission.abstract && (
                                                <div className="mb-4">
                                                    <h4 className="mb-2 font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                        Abstract
                                                    </h4>
                                                    <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                                        {submission.abstract}
                                                    </p>
                                                </div>
                                            )}

                                            {/* All Keywords */}
                                            {submission.keywords &&
                                                submission.keywords.length >
                                                    0 && (
                                                    <div>
                                                        <h4 className="mb-2 flex items-center gap-2 font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                            <Tag className="h-4 w-4 text-[#D4AF37]" />
                                                            Keywords
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {submission.keywords.map(
                                                                (
                                                                    keyword,
                                                                    idx,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 text-xs text-[#1A1A1A]"
                                                                    >
                                                                        {
                                                                            keyword
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Right Column - File Preview */}
                                        <div>
                                            <h4 className="mb-2 flex items-center gap-2 font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                <File className="h-4 w-4 text-[#D4AF37]" />
                                                File Preview
                                            </h4>
                                            {isPdf(submission) &&
                                            submission.file_preview_url ? (
                                                <div className="rounded border border-[#1A1A1A]/10 bg-white p-2">
                                                    <iframe
                                                        src={`${submission.file_preview_url}#view=fitH`}
                                                        className="h-64 w-full"
                                                        title="Document Preview"
                                                    />
                                                    <div className="mt-2 text-center">
                                                        <a
                                                            href={
                                                                submission.file_preview_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-[#D4AF37] hover:underline"
                                                        >
                                                            Open full document
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex h-64 flex-col items-center justify-center rounded border border-[#1A1A1A]/10 bg-white p-6">
                                                    <FileText className="h-12 w-12 text-[#6C6863]/30" />
                                                    <p className="mt-3 font-sans text-sm text-[#6C6863]">
                                                        Preview not available
                                                    </p>
                                                    <p className="font-sans text-xs text-[#6C6863]/60">
                                                        Download the file to
                                                        view its contents
                                                    </p>
                                                    <a
                                                        href={`/faculty/final-submissions/${submission.id}/download`}
                                                        className="mt-3 inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:underline"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Download File
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Verification Notes */}
                                    {submission.verification_notes && (
                                        <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3">
                                            <p className="text-sm text-yellow-800">
                                                <span className="font-medium">
                                                    Verification Notes:
                                                </span>{' '}
                                                {submission.verification_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {submissions.data.length === 0 && (
                    <div className="py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-3 font-sans text-[#6C6863]">
                            No final submissions found.
                        </p>
                        <p className="font-sans text-sm text-[#6C6863]/60">
                            Students who submit approved manuscripts as final
                            papers will appear here.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {submissions.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {submissions.data.length} of{' '}
                            {submissions.total} submissions
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/faculty/final-submissions', {
                                        page: submissions.current_page - 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                    })
                                }
                                disabled={submissions.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="flex h-8 items-center justify-center px-3 font-sans text-sm text-[#1A1A1A]">
                                Page {submissions.current_page} of{' '}
                                {submissions.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/faculty/final-submissions', {
                                        page: submissions.current_page + 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                    })
                                }
                                disabled={
                                    submissions.current_page ===
                                    submissions.last_page
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Alert Dialog for Verification/Archive */}
            <AlertDialog
                open={alertDialogOpen}
                onOpenChange={setAlertDialogOpen}
            >
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            {dialogContent.icon}
                            <AlertDialogTitle className="font-playfair text-2xl">
                                {dialogContent.title}
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="mt-2 text-[#6C6863]">
                            {dialogContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="my-4">
                        <label className="mb-2 block font-sans text-sm font-medium text-[#1A1A1A]">
                            Verification Notes (Optional)
                        </label>
                        <Textarea
                            value={verificationNotes}
                            onChange={(e) =>
                                setVerificationNotes(e.target.value)
                            }
                            placeholder="Add any notes about this verification..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel
                            className="border-[#1A1A1A]/20 hover:bg-[#F9F8F6]"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            disabled={isSubmitting}
                            className={dialogContent.actionClassName}
                        >
                            {isSubmitting
                                ? 'Processing...'
                                : dialogContent.actionText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default FinalSubmissions;
