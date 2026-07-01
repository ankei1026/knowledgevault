// resources/js/Pages/Student/MyManuscripts.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Search,
    Filter,
    Eye,
    Download,
    Edit,
    Trash2,
    Send,
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    Award,
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

interface Document {
    id: number;
    title: string;
    abstract: string | null;
    description: string | null;
    keywords: string[] | null;
    status: string;
    views: number;
    downloads: number;
    citations: number;
    created_at: string;
    updated_at: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    reviewer_feedback: string | null;
    collaborators: Array<{
        id: number;
        name: string;
        email: string;
        pivot: { role: string; status: string };
    }>;
    reviewer: { id: number; name: string; email: string } | null;
    final_submission?: {
        id: number;
        status: 'pending' | 'verified' | 'archived';
        submitted_at: string;
    } | null;
}

interface MyManuscriptsProps {
    documents: {
        data: Document[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        draft: number;
        pending_review: number;
        approved: number;
        rejected: number;
        published: number;
        total_views: number;
        total_downloads: number;
        total_citations: number;
    };
    filters: {
        status: string;
        search: string;
        sort: string;
    };
}

const MyManuscripts: React.FC<MyManuscriptsProps> = ({
    documents,
    stats,
    filters: initialFilters,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        initialFilters.status || 'all',
    );
    const [sortBy, setSortBy] = useState(initialFilters.sort || 'latest');
    const [showFilters, setShowFilters] = useState(false);
    const [actionMenu, setActionMenu] = useState<number | null>(null);

    const statCards = [
        {
            label: 'Total',
            value: stats.total,
            icon: FileText,
            color: '#1A1A1A',
        },
        {
            label: 'Draft',
            value: stats.draft,
            icon: BookOpen,
            color: '#6C6863',
        },
        {
            label: 'Pending',
            value: stats.pending_review,
            icon: Clock,
            color: '#E67E22',
        },
        {
            label: 'Approved',
            value: stats.approved,
            icon: CheckCircle,
            color: '#10B981',
        },
        {
            label: 'Rejected',
            value: stats.rejected,
            icon: XCircle,
            color: '#EF4444',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'pending_review':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'published':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getFinalSubmissionStatusBadge = (status: string) => {
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
            case 'approved':
                return <CheckCircle className="h-3 w-3" />;
            case 'pending_review':
                return <Clock className="h-3 w-3" />;
            case 'rejected':
                return <XCircle className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_review':
                return 'Pending Review';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'published':
                return 'Published';
            default:
                return 'Draft';
        }
    };

    const applyFilters = () => {
        router.get(
            '/student/my-manuscripts',
            {
                search: searchTerm,
                status: statusFilter,
                sort: sortBy,
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
        setSortBy('latest');
        router.get('/student/my-manuscripts', {}, { preserveState: true });
    };

    const handleSubmitForReview = (id: number, title: string) => {
        if (confirm(`Submit "${title}" for review?`)) {
            router.post(
                `/student/my-manuscripts/${id}/submit`,
                {},
                {
                    onSuccess: () => {
                        toast.success('Manuscript submitted for review');
                        setActionMenu(null);
                    },
                    onError: () => {
                        toast.error('Failed to submit manuscript');
                    },
                },
            );
        }
    };

    const handleSubmitFinalPaper = (id: number, title: string) => {
        if (
            confirm(
                `Submit "${title}" as a final paper? This action cannot be undone.`,
            )
        ) {
            router.post(
                `/student/final-papers/submit/${id}`,
                {},
                {
                    onSuccess: () => {
                        toast.success(
                            'Document submitted as final paper successfully!',
                        );
                        setActionMenu(null);
                    },
                    onError: (errors) => {
                        toast.error(
                            'Failed to submit final paper. Please try again.',
                        );
                    },
                },
            );
        }
    };

    const handleDelete = (id: number, title: string) => {
        if (
            confirm(
                `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            )
        ) {
            router.delete(`/student/my-manuscripts/${id}`, {
                onSuccess: () => {
                    toast.success('Manuscript deleted');
                    setActionMenu(null);
                },
                onError: () => {
                    toast.error('Failed to delete manuscript');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="My Manuscripts - ASC KnowledgeVault" />

            <div className="mb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            My Research
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        My Manuscripts
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Manage and track all your capstone manuscripts and
                        research documents.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

                {/* Documents Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {documents.data.map((doc) => (
                        <div
                            key={doc.id}
                            className="group border border-[#1A1A1A]/10 p-5 transition-all duration-500 hover:border-[#D4AF37] hover:shadow-md"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <FileText className="h-8 w-8 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                <div className="flex flex-col items-end gap-1">
                                    <span
                                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(doc.status)}`}
                                    >
                                        {getStatusIcon(doc.status)}
                                        {getStatusLabel(doc.status)}
                                    </span>
                                    {doc.final_submission && (
                                        <span
                                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getFinalSubmissionStatusBadge(doc.final_submission.status)}`}
                                        >
                                            <Award className="h-3 w-3" />
                                            Final:{' '}
                                            {doc.final_submission.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                doc.final_submission.status.slice(
                                                    1,
                                                )}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-playfair mb-2 line-clamp-2 text-lg text-[#1A1A1A]">
                                {doc.title}
                            </h3>

                            <p className="mb-3 line-clamp-2 font-sans text-xs text-[#6C6863]">
                                {doc.abstract || 'No abstract provided'}
                            </p>

                            <div className="mb-4 flex gap-3 text-xs text-[#6C6863]">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {doc.views} views
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Link
                                        href={`/student/my-manuscripts/${doc.id}`}
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                        title="View"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setActionMenu(
                                                actionMenu === doc.id
                                                    ? null
                                                    : doc.id,
                                            )
                                        }
                                        className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {actionMenu === doc.id && (
                                        <div className="absolute top-full right-0 z-10 mt-1 min-w-44 border border-[#1A1A1A]/10 bg-white shadow-lg">
                                            <div className="p-1">
                                                {doc.status === 'draft' && (
                                                    <button
                                                        onClick={() =>
                                                            handleSubmitForReview(
                                                                doc.id,
                                                                doc.title,
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] transition-colors hover:bg-[#F9F8F6]"
                                                    >
                                                        <Send className="h-3 w-3" />
                                                        Submit for Review
                                                    </button>
                                                )}
                                                {doc.status === 'approved' &&
                                                    !doc.final_submission && (
                                                        <button
                                                            onClick={() =>
                                                                handleSubmitFinalPaper(
                                                                    doc.id,
                                                                    doc.title,
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-600 transition-colors hover:bg-green-50"
                                                        >
                                                            <Award className="h-3 w-3" />
                                                            Submit as Final
                                                            Paper
                                                        </button>
                                                    )}
                                                {doc.final_submission && (
                                                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#6C6863]">
                                                        <Award className="h-3 w-3" />
                                                        Final Paper Submitted
                                                    </div>
                                                )}
                                                <Link
                                                    href={`/student/my-manuscripts/${doc.id}/edit`}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] transition-colors hover:bg-[#F9F8F6]"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Edit Details
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            doc.id,
                                                            doc.title,
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {documents.data.length === 0 && (
                    <div className="py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-3 font-sans text-[#6C6863]">
                            No manuscripts found
                        </p>
                        <Link
                            href="/student/documents/upload"
                            className="mt-3 inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#1A1A1A]"
                        >
                            Upload your first manuscript →
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {documents.data.length} of {documents.total}{' '}
                            manuscripts
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/student/my-manuscripts', {
                                        page: documents.current_page - 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        sort: sortBy,
                                    })
                                }
                                disabled={documents.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="flex h-8 items-center justify-center px-3 font-sans text-sm text-[#1A1A1A]">
                                Page {documents.current_page} of{' '}
                                {documents.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/student/my-manuscripts', {
                                        page: documents.current_page + 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        sort: sortBy,
                                    })
                                }
                                disabled={
                                    documents.current_page ===
                                    documents.last_page
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default MyManuscripts;
