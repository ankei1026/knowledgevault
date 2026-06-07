// resources/js/Pages/Faculty/PendingSubmissions.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Clock,
    User,
    Mail,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';

interface Document {
    id: number;
    title: string;
    user: {
        name: string;
        email: string;
    };
    submitted_at: string | null;
    created_at: string;
    status: string;
}

interface PendingSubmissionsProps {
    documents: {
        data: Document[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
    };
}

const PendingSubmissions: React.FC<PendingSubmissionsProps> = ({
    documents,
    stats,
}) => {
    return (
        <AppLayout>
            <Head title="Pending Submissions - ASC KnowledgeVault" />

            <div className="mb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Review Queue
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Pending Submissions
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Review manuscripts that have been submitted by students
                        and are awaiting your feedback.
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-8 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-[#E67E22]" />
                        <div>
                            <p className="font-sans text-sm text-[#1A1A1A]">
                                You have{' '}
                                <span className="font-bold text-[#E67E22]">
                                    {stats.total}
                                </span>{' '}
                                manuscript(s) waiting for review
                            </p>
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                {documents.data.length === 0 ? (
                    <div className="border border-[#1A1A1A]/10 p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-3 font-sans text-[#6C6863]">
                            No pending submissions
                        </p>
                        <p className="mt-1 font-sans text-sm text-[#6C6863]">
                            All caught up!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {documents.data.map((doc) => (
                            <div
                                key={doc.id}
                                className="group border border-[#1A1A1A]/10 p-5 transition-all duration-500 hover:border-[#D4AF37] hover:shadow-md"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <FileText className="h-8 w-8 text-[#E67E22] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-700">
                                        Pending
                                    </span>
                                </div>

                                <h3 className="font-playfair mb-2 line-clamp-2 text-lg text-[#1A1A1A]">
                                    {doc.title}
                                </h3>

                                <div className="mb-3 space-y-1 text-xs text-[#6C6863]">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{doc.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{doc.user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Submitted:{' '}
                                            {doc.submitted_at ||
                                                new Date(
                                                    doc.created_at,
                                                ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/faculty/review/${doc.id}`}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-[#D4AF37] py-2 text-center text-sm text-[#D4AF37] transition-all duration-500 hover:bg-[#D4AF37] hover:text-white"
                                >
                                    <Eye className="h-4 w-4" />
                                    Review Now
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {documents.data.length} of {documents.total}{' '}
                            submissions
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
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

export default PendingSubmissions;
