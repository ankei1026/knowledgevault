// resources/js/Pages/Admin/AllDocuments.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Search,
    Filter,
    Trash2,
    Eye,
    Download,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    Archive,
    HardDrive,
    Users,
    AlertCircle,
    MoreVertical,
    File,
    BookOpen,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Document {
    id: number;
    title: string;
    abstract: string | null;
    status: string;
    authors: string[];
    file_name: string | null;
    file_size: number | null;
    views: number;
    downloads: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
    reviewer: {
        id: number;
        name: string;
    } | null;
    has_final_submission: boolean;
    can_delete: boolean;
}

interface AllDocumentsProps {
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
        with_final: number;
        total_views: number;
        total_downloads: number;
        total_size: string;
    };
    statuses: Record<string, string>;
    filters: {
        search: string;
        status: string;
        date_from: string;
        date_to: string;
        sort: string;
    };
}

const AdminAllDocuments: React.FC<AllDocumentsProps> = ({
    documents,
    stats,
    statuses,
    filters: initialFilters,
}) => {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        initialFilters.status || 'all',
    );
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [sortBy, setSortBy] = useState(initialFilters.sort || 'latest');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkDeleteReason, setBulkDeleteReason] = useState('');

    // Toast notifications for flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
                position: 'top-right',
                style: {
                    border: '1px solid #10B981',
                    padding: '16px',
                    color: '#065F46',
                    background: '#F0FDF4',
                },
                icon: '✅',
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                duration: 4000,
                position: 'top-right',
                style: {
                    border: '1px solid #EF4444',
                    padding: '16px',
                    color: '#991B1B',
                    background: '#FEF2F2',
                },
                icon: '❌',
            });
        }
        if (flash?.warning) {
            toast.custom(
                (t) => (
                    <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                        <div>
                            <p className="font-sans text-sm font-medium text-yellow-800">
                                Warning
                            </p>
                            <p className="font-sans text-sm text-yellow-700">
                                {flash.warning}
                            </p>
                        </div>
                    </div>
                ),
                {
                    duration: 5000,
                    position: 'top-right',
                },
            );
        }
    }, [flash]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'published':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending_review':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-3 w-3" />;
            case 'published':
                return <Archive className="h-3 w-3" />;
            case 'pending_review':
                return <Clock className="h-3 w-3" />;
            case 'rejected':
                return <XCircle className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
        }
    };

    const getStatusLabel = (status: string) => {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const applyFilters = () => {
        toast.loading('Applying filters...', { id: 'filter-loading' });
        router.get(
            '/admin/documents',
            {
                search: searchTerm,
                status: statusFilter,
                date_from: dateFrom,
                date_to: dateTo,
                sort: sortBy,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Filters applied successfully', {
                        id: 'filter-loading',
                    });
                },
                onError: () => {
                    toast.error('Failed to apply filters', {
                        id: 'filter-loading',
                    });
                },
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('latest');
        toast.loading('Resetting filters...', { id: 'reset-loading' });
        router.get(
            '/admin/documents',
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Filters reset successfully', {
                        id: 'reset-loading',
                    });
                },
                onError: () => {
                    toast.error('Failed to reset filters', {
                        id: 'reset-loading',
                    });
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setDeleteReason('');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;

        toast.loading('Deleting document...', { id: 'delete-loading' });
        router.delete(`/admin/documents/${deleteId}`, {
            data: { reason: deleteReason || 'No reason provided.' },
            onSuccess: () => {
                toast.success('Document deleted successfully', {
                    id: 'delete-loading',
                });
                setDeleteDialogOpen(false);
                setDeleteId(null);
                setDeleteReason('');
            },
            onError: () => {
                toast.error('Failed to delete document', {
                    id: 'delete-loading',
                });
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedDocs.length === 0) {
            toast.error('Please select at least one document to delete', {
                duration: 3000,
            });
            return;
        }
        setBulkDeleteReason('');
        setBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        if (selectedDocs.length === 0) {
            toast.error('Please select at least one document to delete');
            return;
        }

        // Log the selected IDs for debugging
        console.log('Bulk delete selected IDs:', selectedDocs);
        console.log('Bulk delete reason:', bulkDeleteReason);

        toast.loading(`Deleting ${selectedDocs.length} documents...`, {
            id: 'bulk-delete-loading',
        });

        router.delete('/admin/documents/bulk', {
            data: {
                ids: selectedDocs,
                reason: bulkDeleteReason || 'Bulk deletion by admin.',
            },
            onSuccess: (page) => {
                console.log('Bulk delete success:', page);
                toast.success(
                    `${selectedDocs.length} documents deleted successfully`,
                    { id: 'bulk-delete-loading' },
                );
                setBulkDeleteDialogOpen(false);
                setSelectedDocs([]);
                setBulkDeleteReason('');
            },
            onError: (errors) => {
                console.error('Bulk delete errors:', errors);
                toast.error('Failed to delete documents. Please try again.', {
                    id: 'bulk-delete-loading',
                });
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedDocs.length === documents.data.length) {
            setSelectedDocs([]);
            toast.success('All documents deselected', { duration: 2000 });
        } else {
            setSelectedDocs(documents.data.map((doc) => doc.id));
            toast.success(`${documents.data.length} documents selected`, {
                duration: 2000,
            });
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedDocs.includes(id)) {
            setSelectedDocs(selectedDocs.filter((docId) => docId !== id));
        } else {
            setSelectedDocs([...selectedDocs, id]);
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const statCards = [
        {
            label: 'Total Documents',
            value: stats.total,
            icon: FileText,
            color: '#1A1A1A',
        },
        {
            label: 'Draft',
            value: stats.draft,
            icon: File,
            color: '#6C6863',
        },
        {
            label: 'Pending Review',
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
            label: 'Published',
            value: stats.published,
            icon: Archive,
            color: '#3B82F6',
        },
        {
            label: 'Total Views',
            value: stats.total_views.toLocaleString(),
            icon: Eye,
            color: '#D4AF37',
        },
    ];

    const deletableCount = documents.data.filter(
        (doc) => doc.can_delete,
    ).length;

    return (
        <AppLayout>
            <Head title="All Documents - ASC KnowledgeVault" />

            <div className="mb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Document Management
                        </span>
                    </div>
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                                All Documents
                            </h1>
                            <p className="font-sans text-base text-[#6C6863]">
                                Manage all documents uploaded to the
                                KnowledgeVault system.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#6C6863]">
                                Storage:{' '}
                                <span className="font-medium text-[#1A1A1A]">
                                    {stats.total_size}
                                </span>
                            </span>
                            {selectedDocs.length > 0 && (
                                <Button
                                    onClick={handleBulkDelete}
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Selected ({selectedDocs.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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

                {/* Delete Info Banner */}
                {deletableCount > 0 && (
                    <div className="mb-4 flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-3">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <p className="font-sans text-sm text-blue-800">
                            {deletableCount} document(s) are eligible for
                            deletion (Draft, Rejected, or Pending Review).
                            {selectedDocs.length > 0 &&
                                ` ${selectedDocs.length} selected.`}
                        </p>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            placeholder="Search by title, author, or email..."
                            className="pl-9"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>

                    <Button onClick={applyFilters}>Apply</Button>

                    <Button variant="ghost" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mb-6 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F8F6] p-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <Label className="mb-2 block">Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statuses).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Sort By</Label>
                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Latest First" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">
                                            Latest First
                                        </SelectItem>
                                        <SelectItem value="oldest">
                                            Oldest First
                                        </SelectItem>
                                        <SelectItem value="views">
                                            Most Viewed
                                        </SelectItem>
                                        <SelectItem value="downloads">
                                            Most Downloaded
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Date From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Date To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Table */}
                <div className="overflow-x-auto border border-[#1A1A1A]/10">
                    <table className="w-full">
                        <thead className="border-b border-[#1A1A1A]/10 bg-[#F9F8F6]">
                            <tr>
                                <th className="w-8 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedDocs.length ===
                                                documents.data.length &&
                                            documents.data.length > 0
                                        }
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                    Document
                                </th>
                                <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                    Author
                                </th>
                                <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                    Created
                                </th>
                                <th className="px-4 py-3 text-center font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.data.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className={`border-b border-[#1A1A1A]/10 transition-colors duration-300 hover:bg-[#F9F8F6]/50 ${
                                        selectedDocs.includes(doc.id)
                                            ? 'bg-[#D4AF37]/5'
                                            : ''
                                    }`}
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocs.includes(
                                                doc.id,
                                            )}
                                            onChange={() =>
                                                toggleSelect(doc.id)
                                            }
                                            className="h-4 w-4 rounded border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-playfair text-sm text-[#1A1A1A]">
                                                {doc.title}
                                            </p>
                                            <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                                {doc.authors.join(', ') ||
                                                    'No authors'}
                                            </p>
                                            {doc.file_name && (
                                                <p className="mt-1 font-sans text-[10px] text-[#6C6863]">
                                                    {doc.file_name} (
                                                    {formatFileSize(
                                                        doc.file_size,
                                                    )}
                                                    )
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {doc.user ? (
                                            <div>
                                                <p className="font-sans text-sm text-[#1A1A1A]">
                                                    {doc.user.name}
                                                </p>
                                                <p className="font-sans text-xs text-[#6C6863]">
                                                    {doc.user.email}
                                                </p>
                                                <span className="inline-block rounded bg-[#1A1A1A]/5 px-1.5 py-0.5 text-[9px] text-[#6C6863]">
                                                    {doc.user.role}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-[#6C6863]">
                                                Unknown
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${getStatusBadge(doc.status)}`}
                                        >
                                            {getStatusIcon(doc.status)}
                                            {getStatusLabel(doc.status)}
                                        </span>
                                        {doc.has_final_submission && (
                                            <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-[#D4AF37]/10 px-1.5 py-0.5 text-[9px] text-[#D4AF37]">
                                                <Archive className="h-2 w-2" />
                                                Final
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="text-xs text-[#6C6863]">
                                            <p>{doc.created_at}</p>
                                            <p className="text-[9px]">
                                                Updated: {doc.updated_at}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/documents/${doc.id}`}
                                                className="rounded p-1 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            {doc.can_delete && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(doc.id)
                                                    }
                                                    className="rounded p-1 text-[#6C6863] transition-colors hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {documents.data.length === 0 && (
                        <div className="py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                            <p className="mt-3 font-sans text-[#6C6863]">
                                No documents found
                            </p>
                            <p className="font-sans text-sm text-[#6C6863]/60">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {documents.data.length} of {documents.total}{' '}
                            documents
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/documents', {
                                        page: documents.current_page - 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        date_from: dateFrom,
                                        date_to: dateTo,
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
                                    router.get('/admin/documents', {
                                        page: documents.current_page + 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        date_from: dateFrom,
                                        date_to: dateTo,
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this document? This
                            action cannot be undone. The user will be notified
                            of this deletion.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <Label className="mb-2 block">
                            Reason for deletion (optional)
                        </Label>
                        <Textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Provide a reason for deleting this document..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Bulk Delete Documents
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            {selectedDocs.length} document(s)? This action
                            cannot be undone. All affected users will be
                            notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <Label className="mb-2 block">
                            Reason for deletion (optional)
                        </Label>
                        <Textarea
                            value={bulkDeleteReason}
                            onChange={(e) =>
                                setBulkDeleteReason(e.target.value)
                            }
                            placeholder="Provide a reason for deleting these documents..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete {selectedDocs.length} Document(s)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default AdminAllDocuments;
