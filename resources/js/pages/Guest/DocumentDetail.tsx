// resources/js/Pages/Guest/DocumentDetail.tsx

import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/Header';
import {
    ChevronLeft,
    Download,
    Eye,
    Calendar,
    User,
    Tag,
    FileText,
    CheckCircle,
    Archive,
    Users,
} from 'lucide-react';

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
`;

interface Document {
    id: number;
    title: string;
    authors: string[];
    abstract: string;
    department: string;
    year: number;
    views: number;
    downloads: number;
    tags: string[];
    file_path: string | null;
    file_name: string | null;
    mime_type: string | null;
    status: string;
    student_name: string | null;
    verified_at: string | null;
    verified_by: string | null;
}

interface DocumentDetailProps {
    document: Document;
    relatedDocuments: Array<{ id: number; title: string }>;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({
    document,
    relatedDocuments,
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Set client flag
        setIsClient(true);

        // Only run on client side
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Check if styles already exist to avoid duplicates
            const dom = window.document;

            if (!dom.getElementById('luxury-styles-detail')) {
                const styleElement = dom.createElement('style');
                styleElement.id = 'luxury-styles-detail';
                styleElement.textContent = luxuryStyles;
                dom.head.appendChild(styleElement);
            }
        }

        return () => {
            // Only clean up on client side
            if (
                typeof window !== 'undefined' &&
                typeof document !== 'undefined'
            ) {
                const dom = window.document;

                const styleElement = dom.getElementById('luxury-styles-detail');

                if (styleElement) {
                    dom.head.removeChild(styleElement);
                }
            }
        };
    }, []);

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
                return <CheckCircle className="h-4 w-4" />;
            case 'archived':
                return <Archive className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
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

    return (
        <>
            <Head title={`${document.title} - ASC KnowledgeVault`} />

            {isClient && <div className="noise-overlay" />}

            <Header />

            <div className="min-h-screen bg-[#F9F8F6] pt-20">
                <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-16 lg:py-20">
                    {/* Back button */}
                    <Link
                        href="/guest/documents"
                        className="group mb-8 inline-flex items-center gap-2 font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Archive
                    </Link>

                    {/* Document Header */}
                    <div className="mb-8 border-b border-[#1A1A1A]/10 pb-8">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                            <h1 className="font-playfair flex-1 text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                                {document.title}
                            </h1>
                            <span
                                className={`flex items-center gap-1 rounded border px-3 py-1 text-sm ${getStatusBadge(document.status)}`}
                            >
                                {getStatusIcon(document.status)}
                                {getStatusLabel(document.status)}
                            </span>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-6 text-sm text-[#6C6863]">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{document.authors.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{document.year}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{document.views} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span>{document.downloads} downloads</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Locked for Guests */}
                    <div className="mb-8 flex flex-wrap gap-4">
                        <button
                            onClick={() => (window.location.href = '/login')}
                            className="group relative h-11 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                        >
                            <span className="absolute inset-0 translate-x-[-100%] bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </span>
                        </button>
                        <Link
                            href="/login"
                            className="flex h-11 items-center border border-[#1A1A1A] px-6 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Sign in to Access Full Text
                        </Link>
                    </div>

                    {/* Document Content */}
                    <div className="grid gap-12 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            {/* Abstract */}
                            {document.abstract && (
                                <div className="mb-8">
                                    <h2 className="font-playfair mb-4 text-2xl text-[#1A1A1A]">
                                        Abstract
                                    </h2>
                                    <div className="prose prose-slate max-w-none font-sans leading-relaxed text-[#6C6863]">
                                        <p>{document.abstract}</p>
                                    </div>
                                </div>
                            )}

                            {/* Preview - Locked for Guests */}
                            <div>
                                <h2 className="font-playfair mb-4 text-2xl text-[#1A1A1A]">
                                    Preview
                                </h2>
                                <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-8 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-[#D4AF37]" />
                                    <p className="mt-4 font-sans text-sm text-[#6C6863]">
                                        Full document preview is available after
                                        signing in.
                                    </p>
                                    <Link
                                        href="/login"
                                        className="mt-4 inline-block font-sans text-sm text-[#D4AF37] underline transition-colors duration-500 hover:text-[#1A1A1A]"
                                    >
                                        Sign in to continue →
                                    </Link>
                                </div>
                            </div>

                            {/* Related Documents */}
                            {relatedDocuments &&
                                relatedDocuments.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="font-playfair mb-4 text-2xl text-[#1A1A1A]">
                                            Related Documents
                                        </h2>
                                        <div className="space-y-2">
                                            {relatedDocuments.map((related) => (
                                                <Link
                                                    key={related.id}
                                                    href={`/guest/documents/${related.id}`}
                                                    className="block border-b border-[#1A1A1A]/10 pb-2 font-sans text-sm text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                                >
                                                    {related.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Sidebar */}
                        <div>
                            <div className="sticky top-8 rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
                                <h3 className="font-playfair mb-4 text-xl text-[#1A1A1A]">
                                    Document Info
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            Status
                                        </div>
                                        <div className="font-sans text-sm">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${getStatusBadge(document.status)}`}
                                            >
                                                {getStatusIcon(document.status)}
                                                {getStatusLabel(
                                                    document.status,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {document.verified_by && (
                                        <div>
                                            <div className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                                Verified By
                                            </div>
                                            <div className="font-sans text-sm text-[#1A1A1A]">
                                                {document.verified_by}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            Publication Year
                                        </div>
                                        <div className="font-sans text-sm text-[#1A1A1A]">
                                            {document.year}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            Tags
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {document.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-[#F9F8F6] px-2 py-1 font-sans text-[10px] text-[#6C6863]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {document.file_name && (
                                        <div>
                                            <div className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                                File
                                            </div>
                                            <div className="font-sans text-sm text-[#6C6863]">
                                                {document.file_name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DocumentDetail;
