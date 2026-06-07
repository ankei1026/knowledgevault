// resources/js/Pages/Guest/Document.tsx

import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Search,
    Shield,
    Clock,
    ArrowRight,
    ChevronDown,
    FileText,
    Users,
    Database,
    Award,
    Menu,
    X,
    Download,
    Eye,
    Calendar,
    User,
    Tag,
    ChevronLeft,
    Filter,
    Grid,
    List,
} from 'lucide-react';

// Custom CSS for luxury/editorial styles
const luxuryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  .font-playfair {
    font-family: 'Playfair Display', serif;
  }

  .writing-mode-vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
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
}

const GuestDocument: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');

    useEffect(() => {
        // Inject custom styles
        const styleElement = document.createElement('style');
        styleElement.textContent = luxuryStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Mock data - replace with actual API data
    const documents: Document[] = [
        {
            id: 1,
            title: 'AI-Powered Learning Management System for Higher Education',
            authors: ['Dr. Maria Santos', 'Prof. John Cruz'],
            abstract:
                'This study explores the implementation of artificial intelligence in learning management systems to personalize student learning experiences.',
            type: 'Capstone Project',
            department: 'Computer Science',
            year: 2024,
            views: 1245,
            downloads: 342,
            tags: ['AI', 'LMS', 'Education Technology'],
        },
        {
            id: 2,
            title: 'Blockchain Technology for Secure Academic Credentials',
            authors: ['Prof. Anna Reyes', 'Dr. James Wilson'],
            abstract:
                'A comprehensive analysis of blockchain implementation for tamper-proof academic credential verification and storage.',
            type: 'Research Paper',
            department: 'Information Technology',
            year: 2023,
            views: 892,
            downloads: 267,
            tags: ['Blockchain', 'Security', 'Credentials'],
        },
        {
            id: 3,
            title: 'Sustainable Architecture: Green Building Design Principles',
            authors: ['Arch. Michael Tan', 'Dr. Lisa Garcia'],
            abstract:
                'An examination of sustainable design principles and their application in modern architecture for energy efficiency.',
            type: 'Thesis',
            department: 'Architecture',
            year: 2024,
            views: 567,
            downloads: 189,
            tags: ['Architecture', 'Sustainability', 'Green Design'],
        },
        {
            id: 4,
            title: 'Data Analytics for Business Intelligence',
            authors: ['Prof. Robert Chen', 'Dr. Patricia Lim'],
            abstract:
                'This research presents data analytics frameworks for enhancing business intelligence and decision-making processes.',
            type: 'Research Paper',
            department: 'Business Administration',
            year: 2023,
            views: 734,
            downloads: 245,
            tags: ['Data Analytics', 'Business Intelligence', 'Big Data'],
        },
    ];

    const documentTypes = ['all', ...new Set(documents.map((doc) => doc.type))];
    const years = [
        'all',
        ...new Set(documents.map((doc) => doc.year.toString())),
    ];

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.authors.some((author) =>
                author.toLowerCase().includes(searchTerm.toLowerCase()),
            ) ||
            doc.abstract.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || doc.type === selectedType;
        const matchesYear =
            selectedYear === 'all' || doc.year.toString() === selectedYear;

        return matchesSearch && matchesType && matchesYear;
    });

    return (
        <>
            <Head title="Document Archive - ASC KnowledgeVault" />

            {/* Noise Overlay */}
            <div className="noise-overlay" />

            {/* Navigation */}
            <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#1A1A1A]/10 bg-[#F9F8F6]/95 backdrop-blur-sm">
                <div className="mx-auto max-w-[1600px] px-6 py-5 lg:px-16">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="group">
                            <div className="mb-1 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                Andres Soriano College of Bislig
                            </div>
                            <h2 className="font-playfair text-xl tracking-tight text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                KnowledgeVault
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center gap-10 md:flex">
                            <Link
                                href="/"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Home
                            </Link>
                            <Link
                                href="/guest/documents"
                                className="font-sans text-sm text-[#D4AF37] transition-colors duration-500"
                            >
                                Archive
                            </Link>
                            <a
                                href="#about"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                About
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="group relative hidden h-11 items-center overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:flex"
                            >
                                <span className="absolute inset-0 translate-x-[-100%] bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                <span className="relative z-10 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                    Access Vault
                                </span>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="p-2 text-[#1A1A1A] md:hidden"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="mt-6 space-y-4 border-t border-[#1A1A1A]/10 pt-6 md:hidden">
                            <Link
                                href="/"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/guest/documents"
                                className="block font-sans text-sm text-[#D4AF37] transition-colors duration-500"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Archive
                            </Link>
                            <a
                                href="#about"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </a>
                            <Link
                                href="/login"
                                className="group relative inline-block h-11 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="absolute inset-0 translate-x-[-100%] bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                <span className="relative z-10 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                    Access Vault
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

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
                                    capstone projects, research papers, and
                                    academic theses from Andres Soriano College
                                    of Bislig.
                                </p>
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
                                    <input
                                        type="text"
                                        placeholder="Search by title, author, or keywords..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="h-12 w-full border border-[#1A1A1A]/20 bg-transparent pr-4 pl-12 font-sans text-sm text-[#1A1A1A] placeholder:text-[#6C6863]/50 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            value={selectedType}
                                            onChange={(e) =>
                                                setSelectedType(e.target.value)
                                            }
                                            className="h-9 border border-[#1A1A1A]/20 bg-transparent px-3 font-sans text-xs text-[#1A1A1A] focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            {documentTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type === 'all'
                                                        ? 'All Types'
                                                        : type}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedYear}
                                            onChange={(e) =>
                                                setSelectedYear(e.target.value)
                                            }
                                            className="h-9 border border-[#1A1A1A]/20 bg-transparent px-3 font-sans text-xs text-[#1A1A1A] focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year === 'all'
                                                        ? 'All Years'
                                                        : year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 transition-colors duration-500 ${
                                                viewMode === 'grid'
                                                    ? 'bg-[#1A1A1A] text-white'
                                                    : 'border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#D4AF37]'
                                            }`}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 transition-colors duration-500 ${
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
                                {filteredDocuments.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                                        <p className="mt-4 font-sans text-sm text-[#6C6863]">
                                            No documents found matching your
                                            criteria.
                                        </p>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredDocuments.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="group border border-[#1A1A1A]/10 bg-white p-6 transition-all duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                                            >
                                                <FileText className="mb-4 h-10 w-10 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                                <h3 className="font-playfair mb-2 line-clamp-2 text-xl text-[#1A1A1A]">
                                                    {doc.title}
                                                </h3>
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
                                                    {doc.tags.map(
                                                        (tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ),
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
                                                        <div className="flex items-center gap-1">
                                                            <Download className="h-3 w-3" />
                                                            <span>
                                                                {doc.downloads}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/documents/${doc.id}`}
                                                        className="font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                                                    >
                                                        View Document →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredDocuments.map((doc) => (
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
                                                        <span>{doc.type}</span>
                                                        <span>•</span>
                                                        <span>{doc.year}</span>
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
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-[#1A1A1A]/10 bg-[#F9F8F6] py-12">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-10 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="mb-1 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                    Andres Soriano College of Bislig
                                </div>
                                <h3 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    KnowledgeVault
                                </h3>
                                <p className="max-w-md font-sans text-sm leading-relaxed text-[#6C6863]">
                                    Preserving academic excellence through
                                    sophisticated document management and
                                    archiving.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-3 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                    Quick Links
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <Link
                                            href="/"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/guest/documents"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Archive
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/login"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Access Vault
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-3 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                    Legal
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Terms of Use
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Data Security
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-10 border-t border-[#1A1A1A]/10 pt-6 text-center">
                            <div className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                © 2025 ASC KnowledgeVault — Capstone Project
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
};

export default GuestDocument;
