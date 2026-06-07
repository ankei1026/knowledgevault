// resources/js/Pages/Student/Dashboard.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    BookOpen,
    TrendingUp,
    Upload,
    ChevronRight,
    Eye,
    AlertCircle,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';

interface StudentDashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    stats: {
        total_documents: number;
        pending_reviews: number;
        approved_documents: number;
        rejected_documents: number;
        draft_documents: number;
    };
    recentDocuments: Array<{
        id: number;
        title: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    pendingDocuments: Array<{
        id: number;
        title: string;
        submitted_at: string;
    }>;
    recentActivity: Array<{
        type: string;
        action: string;
        title: string;
        date: string;
        status: string;
    }>;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
    user,
    stats,
    recentDocuments,
    pendingDocuments,
    recentActivity,
}) => {
    const statCards = [
        {
            title: 'Total Documents',
            value: stats.total_documents,
            icon: FileText,
            bgClass: 'border-t-[#1A1A1A]',
        },
        {
            title: 'Pending Review',
            value: stats.pending_reviews,
            icon: Clock,
            bgClass: 'border-t-[#E67E22]',
        },
        {
            title: 'Approved',
            value: stats.approved_documents,
            icon: CheckCircle,
            bgClass: 'border-t-green-500',
        },
        {
            title: 'Draft',
            value: stats.draft_documents,
            icon: BookOpen,
            bgClass: 'border-t-[#6C6863]',
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
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
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
            default:
                return 'Draft';
        }
    };

    return (
        <AppLayout>
            <Head title="Student Dashboard - ASC KnowledgeVault" />

            <div className="mb-10">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Student Portal
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}
                    </h1>
                    <p className="font-sans text-base leading-relaxed text-[#6C6863]">
                        Manage your capstone manuscripts, track review status, and access your research documents.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={`group ${card.bgClass} border-t-2 pt-4 transition-all duration-700 hover:bg-[#F9F8F6]/50`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            {card.title}
                                        </p>
                                        <p className="font-playfair text-2xl text-[#1A1A1A] lg:text-3xl">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className="border border-[#1A1A1A]/10 p-2 transition-all duration-500 group-hover:border-[#D4AF37]">
                                        <Icon className="h-4 w-4 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pending Reviews Alert */}
                {stats.pending_reviews > 0 && (
                    <div className="mb-8 border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div className="flex-1">
                                <p className="font-sans text-sm text-yellow-800">
                                    You have <strong>{stats.pending_reviews}</strong> document(s) waiting for review.
                                </p>
                            </div>
                            <Link
                                href="/student/library?status=pending_review"
                                className="text-xs font-sans text-yellow-800 underline hover:text-yellow-900"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="mb-12 grid gap-6 lg:grid-cols-12">
                    {/* Left Column - Recent Documents */}
                    <div className="lg:col-span-7">
                        <div className="border border-[#1A1A1A]/10 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-px w-5 bg-[#D4AF37]" />
                                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                            Recent Documents
                                        </span>
                                    </div>
                                    <h3 className="font-playfair text-lg text-[#1A1A1A]">
                                        Your Manuscripts
                                    </h3>
                                </div>
                                <Link
                                    href="/student/library"
                                    className="flex items-center gap-1 font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                >
                                    View All <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentDocuments.length > 0 ? (
                                    recentDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="group border-b border-[#1A1A1A]/10 pb-2 transition-all duration-500 last:border-0 hover:pl-2"
                                        >
                                            <Link href={`/student/documents/${doc.id}`} className="block">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-playfair text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                                                {doc.title}
                                                            </h4>
                                                            <span
                                                                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] ${getStatusBadge(doc.status)}`}
                                                            >
                                                                {getStatusIcon(doc.status)}
                                                                {getStatusLabel(doc.status)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 font-sans text-[10px] text-[#6C6863]">
                                                            {doc.status === 'draft' ? 'Last edited' : 'Submitted'} {doc.updated_at}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-3 w-3 text-[#6C6863] opacity-0 transition-all duration-500 group-hover:opacity-100" />
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center">
                                        <FileText className="mx-auto h-8 w-8 text-[#6C6863]/30" />
                                        <p className="mt-2 font-sans text-sm text-[#6C6863]">
                                            No documents yet
                                        </p>
                                        <Link
                                            href="/student/documents/upload"
                                            className="mt-2 inline-flex items-center gap-2 text-xs text-[#D4AF37] transition-colors hover:text-[#1A1A1A]"
                                        >
                                            <Upload className="h-3 w-3" />
                                            Upload your first manuscript
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-5">
                        {/* Pending Documents */}
                        {pendingDocuments.length > 0 && (
                            <div className="mb-6 border border-[#1A1A1A]/10 p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="h-px w-5 bg-[#D4AF37]" />
                                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                        Awaiting Feedback
                                    </span>
                                </div>
                                <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                    Pending Review
                                </h3>

                                <div className="space-y-3">
                                    {pendingDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2"
                                        >
                                            <div>
                                                <p className="font-sans text-sm text-[#1A1A1A]">
                                                    {doc.title}
                                                </p>
                                                <p className="font-sans text-[10px] text-[#6C6863]">
                                                    Submitted {doc.submitted_at}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/documents/${doc.id}`}
                                                className="text-[#D4AF37] transition-colors hover:text-[#1A1A1A]"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="border border-[#1A1A1A]/10 p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="h-px w-5 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Timeline
                                </span>
                            </div>
                            <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                                Recent Activity
                            </h3>

                            <div className="space-y-3">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 border-l-2 border-[#D4AF37]/30 pl-2"
                                        >
                                            <div className="flex-1">
                                                <p className="font-sans text-xs text-[#1A1A1A]">
                                                    <span className="capitalize">{activity.action}</span>{' '}
                                                    <span className="font-playfair text-[#D4AF37]">
                                                        "{activity.title.length > 40 ? activity.title.substring(0, 40) + '...' : activity.title}"
                                                    </span>
                                                </p>
                                                <p className="mt-1 font-sans text-[10px] text-[#6C6863]">
                                                    {activity.date}
                                                </p>
                                            </div>
                                            {activity.status === 'pending_review' && (
                                                <Clock className="h-3 w-3 text-yellow-600" />
                                            )}
                                            {activity.status === 'approved' && (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            )}
                                            {activity.status === 'rejected' && (
                                                <AlertCircle className="h-3 w-3 text-red-600" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center">
                                        <TrendingUp className="mx-auto h-6 w-6 text-[#6C6863]/30" />
                                        <p className="mt-2 font-sans text-xs text-[#6C6863]">
                                            No recent activity
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-[#1A1A1A]/10 pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/student/documents/upload"
                            className="group relative inline-flex h-10 items-center overflow-hidden bg-[#1A1A1A] px-5 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-white">
                                <Upload className="h-3 w-3" />
                                Upload New Manuscript
                            </span>
                        </Link>
                        <Link
                            href="/student/library"
                            className="inline-flex h-10 items-center gap-2 border border-[#1A1A1A] px-5 font-sans text-xs tracking-[0.2em] text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <BookOpen className="h-3 w-3" />
                            My Library
                        </Link>
                        <Link
                            href="/documents/search"
                            className="inline-flex h-10 items-center gap-2 border border-[#1A1A1A] px-5 font-sans text-xs tracking-[0.2em] text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <FileText className="h-3 w-3" />
                            Browse Archive
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default StudentDashboard;