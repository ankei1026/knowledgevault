// resources/js/Pages/Guest/DocumentDetail.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    Download,
    Eye,
    Calendar,
    User,
    Tag,
    FileText,
} from 'lucide-react';

interface DocumentDetailProps {
    documentId: string;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ documentId }) => {
    // Fetch document data based on ID from your API
    // This is mock data for demonstration
    const document = {
        id: documentId,
        title: 'AI-Powered Learning Management System for Higher Education',
        authors: ['Dr. Maria Santos', 'Prof. John Cruz'],
        abstract:
            'This study explores the implementation of artificial intelligence in learning management systems to personalize student learning experiences. The research demonstrates significant improvements in student engagement and learning outcomes through adaptive learning pathways.',
        type: 'Capstone Project',
        department: 'Computer Science',
        year: 2024,
        views: 1245,
        downloads: 342,
        tags: ['AI', 'LMS', 'Education Technology'],
        content: 'Full document content would be displayed here...',
    };

    return (
        <>
            <Head title={`${document.title} - ASC KnowledgeVault`} />

            <div className="min-h-screen bg-[#F9F8F6]">
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
                        <div className="mb-4 flex items-center gap-3">
                            <div className="h-px w-8 bg-[#D4AF37]" />
                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                {document.type}
                            </span>
                        </div>

                        <h1 className="font-playfair text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                            {document.title}
                        </h1>

                        <div className="mt-6 flex flex-wrap gap-6 text-sm text-[#6C6863]">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
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
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-8 flex gap-4">
                        <button className="group relative h-11 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
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
                            Sign in to Access Full Text
                        </Link>
                    </div>

                    {/* Document Content */}
                    <div className="grid gap-12 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="mb-8">
                                <h2 className="font-playfair mb-4 text-2xl text-[#1A1A1A]">
                                    Abstract
                                </h2>
                                <div className="prose prose-slate max-w-none font-sans leading-relaxed text-[#6C6863]">
                                    <p>{document.abstract}</p>
                                </div>
                            </div>

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
                        </div>

                        <div>
                            <div className="sticky top-8 rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
                                <h3 className="font-playfair mb-4 text-xl text-[#1A1A1A]">
                                    Document Info
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            Department
                                        </div>
                                        <div className="font-sans text-sm text-[#1A1A1A]">
                                            {document.department}
                                        </div>
                                    </div>
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
