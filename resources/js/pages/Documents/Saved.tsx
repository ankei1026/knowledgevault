// resources/js/Pages/Documents/Saved.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    Bookmark,
    BookmarkCheck,
    Search,
    Eye,
    Download,
    User,
    Calendar,
    FileText,
    ChevronLeft,
    ChevronRight,
    Tag,
    X,
    Trash2,
    Edit2,
    File,
    BookOpen,
    CheckCircle,
    Archive,
    Users,
    Grid,
    List,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface SavedDocument {
    id: number;
    notes: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
    final_document: {
        id: number;
        status: 'verified' | 'archived';
        submitted_at: string;
        verified_at: string | null;
        document: {
            id: number;
            title: string;
            abstract: string | null;
            file_path: string | null;
            file_name: string | null;
            file_size: number;
            mime_type: string | null;
            keywords: string[];
            authors: Author[] | string | null;
            user: {
                id: number;
                name: string;
                email: string;
            } | null;
        };
        student: {
            id: number;
            name: string;
            email: string;
        } | null;
        verified_by: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
}

interface SavedDocumentsProps {
    savedDocuments: {
        data: SavedDocument[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
    };
    filters: {
        search: string;
    };
}

const SavedDocuments: React.FC<SavedDocumentsProps> = ({
    savedDocuments,
    stats,
    filters: initialFilters,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [editingTags, setEditingTags] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
                return <CheckCircle className="h-3 w-3" />;
            case 'archived':
                return <Archive className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
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

    const applyFilters = () => {
        router.get(
            '/saved-documents',
            {
                search: searchTerm,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        router.get('/saved-documents', {}, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleRemove = (id: number) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmRemove = () => {
        if (!deleteId) return;

        router.delete(`/saved-documents/${deleteId}`, {
            onSuccess: () => {
                toast.success('Document removed from saved collection');
                setDeleteDialogOpen(false);
                setDeleteId(null);
            },
            onError: () => {
                toast.error('Failed to remove document');
            },
        });
    };

    const handleEdit = (saved: SavedDocument) => {
        setEditingId(saved.id);
        setEditingNotes(saved.notes || '');
        setEditingTags(saved.tags?.join(', ') || '');
    };

    const handleUpdate = () => {
        if (!editingId) return;

        const tagsArray = editingTags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t);

        router.put(
            `/saved-documents/${editingId}`,
            {
                notes: editingNotes,
                tags: tagsArray,
            },
            {
                onSuccess: () => {
                    toast.success('Document updated successfully');
                    setEditingId(null);
                },
                onError: () => {
                    toast.error('Failed to update document');
                },
            },
        );
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const parseAuthors = (authors: Author[] | string | null): Author[] => {
        if (!authors) return [];
        if (Array.isArray(authors)) return authors;
        if (typeof authors === 'string') {
            try {
                const parsed = JSON.parse(authors);
                if (Array.isArray(parsed)) return parsed;
                return [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const getMainAuthor = (authors: Author[] | string | null) => {
        const parsed = parseAuthors(authors);
        if (parsed.length === 0) return 'Unknown Author';
        const main = parsed.find((a) => a.role === 'Main Author');
        return main?.name || parsed[0]?.name || 'Unknown Author';
    };

    const getCoAuthors = (authors: Author[] | string | null) => {
        const parsed = parseAuthors(authors);
        if (parsed.length === 0) return [];
        return parsed.filter((a) => a.role === 'Co-author');
    };

    const isPdf = (mimeType: string | null) => {
        return mimeType === 'application/pdf';
    };

    return (
        <AppLayout>
            <Head title="Saved Documents - ASC KnowledgeVault" />

            <div className="mx-auto max-w-[1600px] px-6 py-8">
                {/* Header - Matching Documents Index */}
                <div className="mb-12">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <div className="mb-5 flex items-center gap-4">
                                <div className="h-px w-10 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Your Collection
                                </span>
                            </div>
                            <h1 className="font-playfair text-5xl leading-[1.1] tracking-tight text-[#1A1A1A] md:text-6xl lg:text-7xl">
                                Saved
                                <br />
                                <span className="text-[#D4AF37] italic">
                                    Documents
                                </span>
                            </h1>
                            <div className="mt-6 h-px w-20 bg-[#1A1A1A]/20" />
                            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-[#6C6863]">
                                Your personal collection of saved documents.
                                {stats.total > 0 && (
                                    <span className="ml-2 text-[#D4AF37]">
                                        ({stats.total} saved)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 border-b border-[#1A1A1A]/10 pb-8">
                    <div className="grid gap-6">
                        <div className="lg:col-span-10">
                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#6C6863]" />
                                <form onSubmit={handleSearch}>
                                    <Input
                                        type="text"
                                        placeholder="Search saved documents by title, notes, or tags..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="h-12 w-full border-[#1A1A1A]/20 pl-12 font-sans text-base shadow-sm focus:border-[#D4AF37] focus:shadow-md"
                                    />
                                </form>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-[#6C6863]">
                                        {savedDocuments.total} saved documents
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded p-2 transition-colors duration-500 ${
                                            viewMode === 'grid'
                                                ? 'bg-[#1A1A1A] text-white'
                                                : 'border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#D4AF37]'
                                        }`}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`rounded p-2 transition-colors duration-500 ${
                                            viewMode === 'list'
                                                ? 'bg-[#1A1A1A] text-white'
                                                : 'border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#D4AF37]'
                                        }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saved Documents Grid/List */}
                {savedDocuments.data.length === 0 ? (
                    <div className="py-20 text-center">
                        <Bookmark className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-4 font-sans text-sm text-[#6C6863]">
                            No saved documents found
                        </p>
                        <p className="font-sans text-sm text-[#6C6863]/60">
                            Start saving documents to build your personal
                            collection
                        </p>
                        <Link
                            href="/documents"
                            className="mt-4 inline-block font-sans text-[#D4AF37] hover:underline"
                        >
                            Browse the repository →
                        </Link>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {savedDocuments.data.map((saved) => {
                            const finalDoc = saved.final_document;
                            const document = finalDoc?.document;
                            const authors = document?.authors || null;
                            const mainAuthor = getMainAuthor(authors);
                            const coAuthors = getCoAuthors(authors);
                            const isEditing = editingId === saved.id;

                            if (!document) return null;

                            return (
                                <div
                                    key={saved.id}
                                    className="group border border-[#1A1A1A]/10 bg-white p-6 transition-all duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookmarkCheck className="h-5 w-5 text-[#D4AF37]" />
                                            <span
                                                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(finalDoc.status)}`}
                                            >
                                                {getStatusIcon(finalDoc.status)}
                                                {getStatusLabel(
                                                    finalDoc.status,
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[#6C6863]">
                                            {new Date(
                                                saved.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-playfair mb-2 line-clamp-2 text-xl text-[#1A1A1A]">
                                        <Link
                                            href={`/documents/${finalDoc.id}`}
                                            className="hover:text-[#D4AF37]"
                                        >
                                            {document.title}
                                        </Link>
                                    </h3>

                                    <div className="mb-3 flex items-center gap-2 text-xs text-[#6C6863]">
                                        <User className="h-3 w-3" />
                                        <span>{mainAuthor}</span>
                                        {coAuthors.length > 0 && (
                                            <span className="text-[10px] text-[#6C6863]/60">
                                                +{coAuthors.length} co-authors
                                            </span>
                                        )}
                                    </div>

                                    <p className="mb-4 line-clamp-3 font-sans text-sm text-[#6C6863]">
                                        {document.abstract}
                                    </p>

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {document.keywords
                                            ?.slice(0, 3)
                                            .map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        {document.keywords?.length > 3 && (
                                            <span className="text-[10px] text-[#6C6863]/60">
                                                +{document.keywords.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
                                        <div className="flex items-center gap-3 text-xs text-[#6C6863]">
                                            {document.file_size && (
                                                <div className="flex items-center gap-1">
                                                    <File className="h-3 w-3" />
                                                    <span>
                                                        {formatFileSize(
                                                            document.file_size,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleEdit(saved)
                                                }
                                                className="rounded p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRemove(saved.id)
                                                }
                                                className="rounded p-1.5 text-[#6C6863] transition-colors hover:text-red-500"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Form - Inline for Grid */}
                                    {isEditing && (
                                        <div className="mt-4 space-y-3 rounded border border-[#D4AF37]/30 bg-[#F9F8F6] p-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#6C6863]">
                                                    Notes
                                                </label>
                                                <Textarea
                                                    value={editingNotes}
                                                    onChange={(e) =>
                                                        setEditingNotes(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Add personal notes..."
                                                    rows={2}
                                                    className="resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#6C6863]">
                                                    Tags (comma separated)
                                                </label>
                                                <Input
                                                    value={editingTags}
                                                    onChange={(e) =>
                                                        setEditingTags(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="research, capstone, AI, ..."
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleUpdate}
                                                    className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEditingId(null)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedDocuments.data.map((saved) => {
                            const finalDoc = saved.final_document;
                            const document = finalDoc?.document;
                            const authors = document?.authors || null;
                            const mainAuthor = getMainAuthor(authors);
                            const coAuthors = getCoAuthors(authors);
                            const isEditing = editingId === saved.id;

                            if (!document) return null;

                            return (
                                <div
                                    key={saved.id}
                                    className="group flex flex-col gap-4 border-b border-[#1A1A1A]/10 pb-6 transition-all duration-500 hover:border-[#D4AF37]/30 md:flex-row md:items-start"
                                >
                                    <div className="flex-shrink-0">
                                        <BookmarkCheck className="h-8 w-8 text-[#D4AF37]" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/documents/${finalDoc.id}`}
                                                className="font-playfair text-xl text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                            >
                                                {document.title}
                                            </Link>
                                            <span
                                                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(finalDoc.status)}`}
                                            >
                                                {getStatusIcon(finalDoc.status)}
                                                {getStatusLabel(
                                                    finalDoc.status,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6C6863]">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {mainAuthor}
                                                {coAuthors.length > 0 && (
                                                    <span className="text-[10px] text-[#6C6863]/60">
                                                        +{coAuthors.length}{' '}
                                                        co-authors
                                                    </span>
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Saved{' '}
                                                {new Date(
                                                    saved.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                            {document.file_size && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <File className="h-3 w-3" />
                                                        {formatFileSize(
                                                            document.file_size,
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="mt-2 line-clamp-2 font-sans text-sm text-[#6C6863]">
                                            {document.abstract}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {document.keywords
                                                ?.slice(0, 3)
                                                .map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            {document.keywords?.length > 3 && (
                                                <span className="text-[10px] text-[#6C6863]/60">
                                                    +
                                                    {document.keywords.length -
                                                        3}
                                                </span>
                                            )}
                                        </div>
                                        {saved.tags &&
                                            saved.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {saved.tags.map(
                                                        (tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs text-[#D4AF37]"
                                                            >
                                                                <Tag className="mr-1 inline h-3 w-3" />
                                                                {tag}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-4 md:flex-col md:items-end">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleEdit(saved)
                                                }
                                                className="rounded p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRemove(saved.id)
                                                }
                                                className="rounded p-1.5 text-[#6C6863] transition-colors hover:text-red-500"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/documents/${finalDoc.id}`}
                                                className="flex items-center gap-1 text-xs text-[#1A1A1A] transition-colors hover:text-[#D4AF37]"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </Link>
                                            {document.file_path && (
                                                <a
                                                    href={`/documents/${finalDoc.id}/download`}
                                                    className="flex items-center gap-1 text-xs text-[#1A1A1A] transition-colors hover:text-[#D4AF37]"
                                                >
                                                    <Download className="h-3 w-3" />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit Form - Inline for List */}
                                    {isEditing && (
                                        <div className="mt-4 w-full space-y-3 rounded border border-[#D4AF37]/30 bg-[#F9F8F6] p-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#6C6863]">
                                                    Notes
                                                </label>
                                                <Textarea
                                                    value={editingNotes}
                                                    onChange={(e) =>
                                                        setEditingNotes(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Add personal notes..."
                                                    rows={2}
                                                    className="resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#6C6863]">
                                                    Tags (comma separated)
                                                </label>
                                                <Input
                                                    value={editingTags}
                                                    onChange={(e) =>
                                                        setEditingTags(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="research, capstone, AI, ..."
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleUpdate}
                                                    className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEditingId(null)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {savedDocuments.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {savedDocuments.data.length} of{' '}
                            {savedDocuments.total} saved documents
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/saved-documents', {
                                        page: savedDocuments.current_page - 1,
                                        search: searchTerm,
                                    })
                                }
                                disabled={savedDocuments.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="flex h-8 items-center justify-center px-3 font-sans text-sm text-[#1A1A1A]">
                                Page {savedDocuments.current_page} of{' '}
                                {savedDocuments.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/saved-documents', {
                                        page: savedDocuments.current_page + 1,
                                        search: searchTerm,
                                    })
                                }
                                disabled={
                                    savedDocuments.current_page ===
                                    savedDocuments.last_page
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
                        <AlertDialogTitle>
                            Remove Saved Document
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this document from
                            your saved collection? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemove}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default SavedDocuments;
