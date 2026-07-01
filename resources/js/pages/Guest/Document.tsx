// resources/js/Pages/Guest/Document.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Header from '@/components/Header';
import {
    FileText,
    Search,
    Eye,
    Download,
    Calendar,
    User,
    Tag,
    Grid,
    List,
    CheckCircle,
    Archive,
} from 'lucide-react';

// Custom CSS for luxury/editorial styles
const luxuryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  .font-playfair {
    font-family: 'Playfair Display', serif;
  }

  .noise-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    opacity: 0.02;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .group-hover\\:grayscale-0,
    .group-hover\\:scale-105,
    .transition-all,
    .duration-500,
    .duration-700,
    .duration-\\[1500ms\\] {
      transition-duration: 0.01ms !important;
    }
  }
`;

interface Document {
    id: number;
    title: string;
    authors: string[];
    abstract: string;
    type: string;
    department: string;
    year: number;
    views: number;
    downloads: number;
    tags: string[];
    status: string;
    file_path: string | null;
    file_name: string | null;
    mime_type: string | null;
    student_name: string | null;
    verified_at: string | null;
}

interface GuestDocumentProps {
    documents: {
        data: Document[];
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
        year: string;
        sort: string;
    };
}

const GuestDocument: React.FC<GuestDocumentProps> = ({
    documents,
    stats,
    years,
    filters: initialFilters,
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedYear, setSelectedYear] = useState<string>(
        initialFilters.year || 'all',
    );
    const [sortBy, setSortBy] = useState<string>(
        initialFilters.sort || 'latest',
    );

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = luxuryStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const applyFilters = () => {
        router.get(
            '/guest/documents',
            {
                search: searchTerm,
                year: selectedYear,
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
        setSelectedYear('all');
        setSortBy('latest');
        router.get('/guest/documents', {}, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

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

    const yearsList = ['all', ...years.map((y) => y.toString())];

    return (
        <>
            <Head title="Document Archive - ASC KnowledgeVault" />

            <div className="noise-overlay" />

            <Header />

            <main className="z-20 pt-32">
                {/* Hero Section */}
                <section className="border-b border-[#1A1A1A]/10 pb-12">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-10 lg:grid-cols-12">
                            <div className="lg:col-span-8 lg:col-start-2">
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
                                    Explore our comprehensive collection of
                                    verified and archived final papers from
                                    Andres Soriano College of Bislig.
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
                </section>

                {/* Search and Filter Section */}
                <section className="border-b border-[#1A1A1A]/10 py-8">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-10 lg:col-start-2">
                                {/* Search Bar */}
                                <div className="relative mb-6">
                                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#6C6863]" />
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            placeholder="Search by title, author, or keywords..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="h-12 w-full border border-[#1A1A1A]/20 bg-transparent pr-4 pl-12 font-sans text-sm text-[#1A1A1A] placeholder:text-[#6C6863]/50 focus:border-[#D4AF37] focus:outline-none"
                                        />
                                    </form>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => {
                                                setSelectedYear(e.target.value);
                                                applyFilters();
                                            }}
                                            className="h-9 border border-[#1A1A1A]/20 bg-transparent px-3 font-sans text-xs text-[#1A1A1A] focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            {yearsList.map((year) => (
                                                <option key={year} value={year}>
                                                    {year === 'all'
                                                        ? 'All Years'
                                                        : year}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={sortBy}
                                            onChange={(e) => {
                                                setSortBy(e.target.value);
                                                applyFilters();
                                            }}
                                            className="h-9 border border-[#1A1A1A]/20 bg-transparent px-3 font-sans text-xs text-[#1A1A1A] focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            <option value="latest">
                                                Latest First
                                            </option>
                                            <option value="oldest">
                                                Oldest First
                                            </option>
                                        </select>
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
                </section>

                {/* Documents Grid/List */}
                <section className="py-12 lg:py-20">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-10 lg:col-start-2">
                                {documents.data.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                                        <p className="mt-4 font-sans text-sm text-[#6C6863]">
                                            No documents found matching your
                                            criteria.
                                        </p>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {documents.data.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="group border border-[#1A1A1A]/10 bg-white p-6 transition-all duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <FileText className="h-10 w-10 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                                    <span
                                                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(doc.status)}`}
                                                    >
                                                        {getStatusIcon(
                                                            doc.status,
                                                        )}
                                                        {getStatusLabel(
                                                            doc.status,
                                                        )}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/guest/documents/${doc.id}`}
                                                    className="block"
                                                >
                                                    <h3 className="font-playfair mb-2 line-clamp-2 text-xl text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                                        {doc.title}
                                                    </h3>
                                                </Link>

                                                <div className="mb-3 flex items-center gap-2 text-xs text-[#6C6863]">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        {doc.authors.join(', ')}
                                                    </span>
                                                </div>

                                                <p className="mb-4 line-clamp-3 font-sans text-sm text-[#6C6863]">
                                                    {doc.abstract}
                                                </p>

                                                <div className="mb-4 flex flex-wrap gap-2">
                                                    {doc.tags
                                                        .slice(0, 3)
                                                        .map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    {doc.tags.length > 3 && (
                                                        <span className="text-[10px] text-[#6C6863]/60">
                                                            +
                                                            {doc.tags.length -
                                                                3}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
                                                    <div className="flex items-center gap-3 text-xs text-[#6C6863]">
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            <span>
                                                                {doc.views}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/guest/documents/${doc.id}`}
                                                        className="font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                                                    >
                                                        View →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {documents.data.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="group flex flex-col gap-4 border-b border-[#1A1A1A]/10 pb-6 transition-all duration-500 hover:border-[#D4AF37]/30 md:flex-row md:items-start"
                                            >
                                                <div className="flex-shrink-0">
                                                    <FileText className="h-10 w-10 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                                </div>
                                                <div className="flex-grow">
                                                    <Link
                                                        href={`/guest/documents/${doc.id}`}
                                                        className="font-playfair text-xl text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                                    >
                                                        {doc.title}
                                                    </Link>
                                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6C6863]">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {doc.authors.join(
                                                                ', ',
                                                            )}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{doc.year}</span>
                                                        <span>•</span>
                                                        <span
                                                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${getStatusBadge(doc.status)}`}
                                                        >
                                                            {getStatusIcon(
                                                                doc.status,
                                                            )}
                                                            {getStatusLabel(
                                                                doc.status,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 line-clamp-2 font-sans text-sm text-[#6C6863]">
                                                        {doc.abstract}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {doc.tags
                                                            .slice(0, 3)
                                                            .map((tag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        {doc.tags.length >
                                                            3 && (
                                                            <span className="text-[10px] text-[#6C6863]/60">
                                                                +
                                                                {doc.tags
                                                                    .length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-shrink-0 items-center gap-4 md:flex-col md:items-end">
                                                    <div className="flex items-center gap-2 text-xs text-[#6C6863]">
                                                        <Eye className="h-3 w-3" />
                                                        <span>{doc.views}</span>
                                                    </div>
                                                    <Link
                                                        href={`/guest/documents/${doc.id}`}
                                                        className="font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                                                    >
                                                        Read →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {documents.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-between">
                                        <p className="font-sans text-sm text-[#6C6863]">
                                            Showing {documents.data.length} of{' '}
                                            {documents.total} documents
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/guest/documents',
                                                        {
                                                            page:
                                                                documents.current_page -
                                                                1,
                                                            search: searchTerm,
                                                            year: selectedYear,
                                                            sort: sortBy,
                                                        },
                                                    )
                                                }
                                                disabled={
                                                    documents.current_page === 1
                                                }
                                                className="rounded border border-[#1A1A1A]/20 px-3 py-1 text-sm transition-colors hover:border-[#D4AF37] disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="flex items-center px-3 font-sans text-sm text-[#1A1A1A]">
                                                Page {documents.current_page} of{' '}
                                                {documents.last_page}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/guest/documents',
                                                        {
                                                            page:
                                                                documents.current_page +
                                                                1,
                                                            search: searchTerm,
                                                            year: selectedYear,
                                                            sort: sortBy,
                                                        },
                                                    )
                                                }
                                                disabled={
                                                    documents.current_page ===
                                                    documents.last_page
                                                }
                                                className="rounded border border-[#1A1A1A]/20 px-3 py-1 text-sm transition-colors hover:border-[#D4AF37] disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default GuestDocument;
