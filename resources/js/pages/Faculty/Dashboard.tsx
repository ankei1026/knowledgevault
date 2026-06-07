// resources/js/Pages/Faculty/Dashboard.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Clock,
    CheckCircle,
    XCircle,
    BookOpen,
    Eye,
    TrendingUp,
    Calendar,
    ChevronRight,
    FileText,
    Send,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';

interface FacultyDashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    stats: {
        pending_reviews: number;
        under_review: number;
        completed_reviews: number;
        total_reviews: number;
        avg_response_time: string;
    };
    pendingReviews: Array<{
        id: number;
        title: string;
        author: string;
        author_email: string;
        submitted_at: string;
        status: string;
    }>;
    recentlyReviewed: Array<{
        id: number;
        title: string;
        author: string;
        status: string;
        reviewed_at: string;
        feedback: string | null;
    }>;
    recentActivity: Array<{
        type: string;
        action: string;
        title: string;
        date: string;
        status: string;
    }>;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
    user,
    stats,
    pendingReviews,
    recentlyReviewed,
    recentActivity,
}) => {
    const statCards = [
        {
            title: 'Pending Reviews',
            value: stats.pending_reviews,
            icon: Clock,
            bgClass: 'border-t-[#E67E22]',
        },
        {
            title: 'Completed Reviews',
            value: stats.completed_reviews,
            icon: CheckCircle,
            bgClass: 'border-t-green-500',
        },
        {
            title: 'Total Reviews',
            value: stats.total_reviews,
            icon: FileText,
            bgClass: 'border-t-[#1A1A1A]',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'pending_review':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-3 w-3" />;
            case 'rejected':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Faculty Dashboard - ASC KnowledgeVault" />

            <div className="mb-10">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Faculty Portal
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Welcome back, Prof. {user.name.split(' ')[0]}
                    </h1>
                    <p className="font-sans text-base leading-relaxed text-[#6C6863]">
                        Review manuscripts and track your academic
                        contributions.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                {/* Two Column Layout */}
                <div className="mb-12 grid gap-6 lg:grid-cols-12">
                    {/* Left Column - Pending Reviews */}
                    <div className="lg:col-span-7">
                        <div className="border border-[#1A1A1A]/10 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-px w-5 bg-[#D4AF37]" />
                                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                            Action Required
                                        </span>
                                    </div>
                                    <h3 className="font-playfair text-lg text-[#1A1A1A]">
                                        Pending Reviews
                                    </h3>
                                </div>
                                <Link
                                    href="/faculty/pending-submissions"
                                    className="flex items-center gap-1 font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                >
                                    View All{' '}
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {pendingReviews.length > 0 ? (
                                    pendingReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="group border-b border-[#1A1A1A]/10 pb-3 transition-all duration-500 last:border-0 hover:pl-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-playfair text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                                        {review.title}
                                                    </h4>
                                                    <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                                        By: {review.author}
                                                    </p>
                                                    <p className="font-sans text-[10px] text-[#6C6863]">
                                                        Submitted:{' '}
                                                        {review.submitted_at}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/faculty/review/${review.id}`}
                                                    className="ml-2 rounded border border-[#D4AF37] px-3 py-1 text-xs text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-white"
                                                >
                                                    Review Now
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                                        <p className="mt-2 font-sans text-sm text-[#6C6863]">
                                            No pending reviews
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            All caught up!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recently Reviewed */}
                        {recentlyReviewed.length > 0 && (
                            <div className="mt-6 border border-[#1A1A1A]/10 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="h-px w-5 bg-[#D4AF37]" />
                                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                                History
                                            </span>
                                        </div>
                                        <h3 className="font-playfair text-lg text-[#1A1A1A]">
                                            Recently Reviewed
                                        </h3>
                                    </div>
                                    <Link
                                        href="/faculty/review-history"
                                        className="flex items-center gap-1 font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                    >
                                        View All{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {recentlyReviewed.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b border-[#1A1A1A]/10 pb-3 last:border-0"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-playfair text-sm text-[#1A1A1A]">
                                                            {review.title}
                                                        </h4>
                                                        <span
                                                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] ${getStatusBadge(review.status)}`}
                                                        >
                                                            {getStatusIcon(
                                                                review.status,
                                                            )}
                                                            {review.status ===
                                                            'approved'
                                                                ? 'Approved'
                                                                : 'Rejected'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                                        By: {review.author}
                                                    </p>
                                                    <p className="font-sans text-[10px] text-[#6C6863]">
                                                        Reviewed:{' '}
                                                        {review.reviewed_at}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/documents/${review.id}`}
                                                    className="text-[#D4AF37] transition-colors hover:text-[#1A1A1A]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Recent Activity */}
                    <div className="lg:col-span-5">
                        <div className="border border-[#1A1A1A]/10 p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="h-px w-5 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Activity
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
                                                    <span className="capitalize">
                                                        {activity.action}
                                                    </span>{' '}
                                                    <span className="font-playfair text-[#D4AF37]">
                                                        "
                                                        {activity.title.length >
                                                        40
                                                            ? activity.title.substring(
                                                                  0,
                                                                  40,
                                                              ) + '...'
                                                            : activity.title}
                                                        "
                                                    </span>
                                                </p>
                                                <p className="mt-1 font-sans text-[10px] text-[#6C6863]">
                                                    {activity.date}
                                                </p>
                                            </div>
                                            {activity.status === 'approved' && (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            )}
                                            {activity.status === 'rejected' && (
                                                <XCircle className="h-3 w-3 text-red-600" />
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
                            href="/faculty/pending-submissions"
                            className="group relative inline-flex h-10 items-center overflow-hidden bg-[#1A1A1A] px-5 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-white">
                                <FileText className="h-3 w-3" />
                                Review Pending Manuscripts
                            </span>
                        </Link>
                        <Link
                            href="/documents/search"
                            className="inline-flex h-10 items-center gap-2 border border-[#1A1A1A] px-5 font-sans text-xs tracking-[0.2em] text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <BookOpen className="h-3 w-3" />
                            Browse Archive
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default FacultyDashboard;
