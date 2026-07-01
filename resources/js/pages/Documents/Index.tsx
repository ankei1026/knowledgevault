// resources/js/Pages/Documents/Index.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Search,
    Eye,
    Download,
    CheckCircle,
    Archive,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Tag,
    Users,
    File,
    BookOpen,
    X,
    Filter,
    Bookmark,
    BookmarkCheck,
    Grid,
    List,
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

interface Author {
    name: string;
    email: string | null;
    role: string;
}

interface DocumentData {
    id: number;
    status: 'verified' | 'archived';
    submitted_at: string;
    verified_at: string | null;
    verification_notes: string | null;
    is_saved?: boolean;
    document: {
        id: number;
        title: string;
        abstract: string | null;
        description: string | null;
        file_path: string | null;
        file_name: string | null;
        file_size: number;
        mime_type: string | null;
        keywords: string[];
        authors: Author[];
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
}

interface DocumentsIndexProps {
    documents: {
        data: DocumentData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        verified: number;
        archived: number;
    };
    years: number[];
    filters: {
        search: string;
        status: string;
        year: string;
    };
}

const DocumentsIndex: React.FC<DocumentsIndexProps> = ({
    documents,
    stats,
    years,
    filters: initialFilters,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        initialFilters.status || 'all',
    );
    const [yearFilter, setYearFilter] = useState(initialFilters.year || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [savedStates, setSavedStates] = useState<Record<number, boolean>>({});
    const [togglingSave, setTogglingSave] = useState<number | null>(null);

    // Initialize saved states from props
    useEffect(() => {
        const initialStates: Record<number, boolean> = {};
        documents.data.forEach((doc) => {
            if (doc.is_saved !== undefined) {
                initialStates[doc.id] = doc.is_saved;
            }
        });
        setSavedStates(initialStates);
    }, [documents.data]);

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
            '/documents',
            {
                search: searchTerm,
                status: statusFilter,
                year: yearFilter === 'all' ? '' : yearFilter, // Convert 'all' to empty string for backend
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
        setYearFilter('all'); // Change from '' to 'all'
        router.get('/documents', {}, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleToggleSave = (docId: number, finalDocId: number) => {
        setTogglingSave(docId);

        router.post(
            '/saved-documents/toggle',
            {
                final_document_id: finalDocId,
            },
            {
                onSuccess: () => {
                    const newState = !savedStates[docId];
                    setSavedStates((prev) => ({
                        ...prev,
                        [docId]: newState,
                    }));
                    toast.success(
                        newState
                            ? 'Document saved to your collection'
                            : 'Document removed from saved collection',
                    );
                    setTogglingSave(null);
                },
                onError: () => {
                    toast.error('Failed to toggle save status');
                    setTogglingSave(null);
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

    // Get main author name for display
    const getMainAuthor = (authors: Author[]) => {
        const main = authors.find((a) => a.role === 'Main Author');
        return main?.name || 'Unknown Author';
    };

    // Get co-authors for display
    const getCoAuthors = (authors: Author[]) => {
        return authors.filter((a) => a.role === 'Co-author');
    };

    const documentTypes = [
        'all',
        ...new Set(
            documents.data.map((doc) => doc.document?.type || 'Unknown'),
        ),
    ];
    const availableYears = [
        'all',
        ...new Set(
            documents.data.map((doc) =>
                new Date(doc.submitted_at).getFullYear().toString(),
            ),
        ),
    ];

    return (
        <AppLayout>
            <Head title="Document Repository - ASC KnowledgeVault" />

            <div className="mx-auto max-w-[1600px] px-6 py-8">
                {/* Hero Section - Like Guest Document */}
                <div className="mb-12">
                    <div className="grid gap-10">
                        <div className="lg:col-span-8">
                            <div className="mb-5 flex items-center gap-4">
                                <div className="h-px w-10 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Academic Archive
                                </span>
                            </div>
                            <h1 className="font-playfair text-5xl leading-[1.1] tracking-tight text-[#1A1A1A] md:text-6xl lg:text-7xl">
                                Document
                                <br />
                                <span className="text-[#D4AF37] italic">
                                    Repository
                                </span>
                            </h1>
                            <div className="mt-6 h-px w-20 bg-[#1A1A1A]/20" />
                            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-[#6C6863]">
                                Explore our comprehensive collection of verified
                                and archived final papers from Andres Soriano
                                College of Bislig.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-6 text-sm text-[#6C6863]">
                                <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#D4AF37]" />
                                    {stats.total} Documents
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 border-b border-[#1A1A1A]/10 pb-8">
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-12">
                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#6C6863]" />
                                <form onSubmit={handleSearch}>
                                    <Input
                                        type="text"
                                        placeholder="Search by title, author, or keywords..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="h-12 w-full border-[#1A1A1A]/20 pl-12 font-sans text-base shadow-sm focus:border-[#D4AF37] focus:shadow-md"
                                    />
                                </form>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-3">
                                    <Select
                                        value={yearFilter}
                                        onValueChange={setYearFilter}
                                    >
                                        <SelectTrigger className="h-9 w-32">
                                            <SelectValue placeholder="All Years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Years
                                            </SelectItem>
                                            {years.map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={String(year)}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={yearFilter}
                                        onValueChange={setYearFilter}
                                    >
                                        <SelectTrigger className="h-9 w-32">
                                            <SelectValue placeholder="All Years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Years
                                            </SelectItem>
                                            {years.map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={String(year)}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={applyFilters}
                                        className="h-9 bg-[#1A1A1A] px-4 hover:bg-[#D4AF37]"
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="h-9"
                                    >
                                        Reset
                                    </Button>
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

                {/* Results Count */}
                <div className="mb-4 text-sm text-[#6C6863]">
                    Showing {documents.data.length} of {documents.total}{' '}
                    documents
                </div>

                {/* Documents Grid/List */}
                {documents.data.length === 0 ? (
                    <div className="py-20 text-center">
                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-4 font-sans text-sm text-[#6C6863]">
                            No documents found matching your criteria.
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {documents.data.map((doc) => {
                            const mainAuthor = getMainAuthor(
                                doc.document.authors,
                            );
                            const coAuthors = getCoAuthors(
                                doc.document.authors,
                            );
                            const isPdf =
                                doc.document.mime_type === 'application/pdf';
                            const isSaved =
                                savedStates[doc.id] ?? doc.is_saved ?? false;
                            const isToggling = togglingSave === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className="group border border-[#1A1A1A]/10 bg-white p-6 transition-all duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <FileText className="h-10 w-10 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                        <span
                                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(doc.status)}`}
                                        >
                                            {getStatusIcon(doc.status)}
                                            {getStatusLabel(doc.status)}
                                        </span>
                                    </div>

                                    <h3 className="font-playfair mb-2 line-clamp-2 text-xl text-[#1A1A1A]">
                                        <Link
                                            href={`/documents/${doc.id}`}
                                            className="hover:text-[#D4AF37]"
                                        >
                                            {doc.document.title}
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
                                        {doc.document.abstract}
                                    </p>

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {doc.document.keywords
                                            ?.slice(0, 3)
                                            .map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        {doc.document.keywords?.length > 3 && (
                                            <span className="text-[10px] text-[#6C6863]/60">
                                                +
                                                {doc.document.keywords.length -
                                                    3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
                                        <div className="flex items-center gap-3 text-xs text-[#6C6863]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{doc.submitted_at}</span>
                                            </div>
                                            {doc.document.file_size && (
                                                <div className="flex items-center gap-1">
                                                    <File className="h-3 w-3" />
                                                    <span>
                                                        {formatFileSize(
                                                            doc.document
                                                                .file_size,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* <button
                                                onClick={() =>
                                                    handleToggleSave(
                                                        doc.id,
                                                        doc.id,
                                                    )
                                                }
                                                disabled={isToggling}
                                                className={`rounded p-1.5 transition-colors ${
                                                    isSaved
                                                        ? 'text-[#D4AF37] hover:text-[#1A1A1A]'
                                                        : 'text-[#6C6863] hover:text-[#D4AF37]'
                                                } disabled:opacity-50`}
                                            >
                                                {isSaved ? (
                                                    <BookmarkCheck className="h-4 w-4" />
                                                ) : (
                                                    <Bookmark className="h-4 w-4" />
                                                )}
                                            </button> */}
                                            <Link
                                                href={`/documents/${doc.id}`}
                                                className="font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.data.map((doc) => {
                            const mainAuthor = getMainAuthor(
                                doc.document.authors,
                            );
                            const coAuthors = getCoAuthors(
                                doc.document.authors,
                            );
                            const isPdf =
                                doc.document.mime_type === 'application/pdf';
                            const isSaved =
                                savedStates[doc.id] ?? doc.is_saved ?? false;
                            const isToggling = togglingSave === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className="group flex flex-col gap-4 border-b border-[#1A1A1A]/10 pb-6 transition-all duration-500 hover:border-[#D4AF37]/30 md:flex-row md:items-start"
                                >
                                    <div className="flex-shrink-0">
                                        <FileText className="h-10 w-10 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                    </div>
                                    <div className="flex-grow">
                                        <Link
                                            href={`/documents/${doc.id}`}
                                            className="font-playfair text-xl text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            {doc.document.title}
                                        </Link>
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
                                            <span>{doc.submitted_at}</span>
                                            <span>•</span>
                                            <span
                                                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(doc.status)}`}
                                            >
                                                {getStatusIcon(doc.status)}
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 font-sans text-sm text-[#6C6863]">
                                            {doc.document.abstract}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {doc.document.keywords
                                                ?.slice(0, 3)
                                                .map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            {doc.document.keywords?.length >
                                                3 && (
                                                <span className="text-[10px] text-[#6C6863]/60">
                                                    +
                                                    {doc.document.keywords
                                                        .length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-4 md:flex-col md:items-end">
                                        {/* <button
                                            onClick={() =>
                                                handleToggleSave(doc.id, doc.id)
                                            }
                                            disabled={isToggling}
                                            className={`rounded p-1.5 transition-colors ${
                                                isSaved
                                                    ? 'text-[#D4AF37] hover:text-[#1A1A1A]'
                                                    : 'text-[#6C6863] hover:text-[#D4AF37]'
                                            } disabled:opacity-50`}
                                        >
                                            {isSaved ? (
                                                <BookmarkCheck className="h-4 w-4" />
                                            ) : (
                                                <Bookmark className="h-4 w-4" />
                                            )}
                                        </button> */}
                                        <Link
                                            href={`/documents/${doc.id}`}
                                            className="font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            View →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {documents.data.length} of {documents.total}{' '}
                            documents
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/documents', {
                                        page: documents.current_page - 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        year: yearFilter,
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
                                    router.get('/documents', {
                                        page: documents.current_page + 1,
                                        search: searchTerm,
                                        status: statusFilter,
                                        year: yearFilter,
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

export default DocumentsIndex;
