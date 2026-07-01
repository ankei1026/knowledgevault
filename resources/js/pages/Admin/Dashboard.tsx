// resources/js/Pages/Admin/Dashboard.tsx (No recharts version)

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    FileText,
    Clock,
    HardDrive,
    CheckCircle,
    TrendingUp,
    UserPlus,
    BookOpen,
    Activity,
    ChevronRight,
    Database,
    Calendar,
    Award,
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    PieChart,
    ArrowUp,
    ArrowDown,
    Zap,
    User,
    Mail,
    Shield,
    Star,
    Download as DownloadIcon,
    Eye as EyeIcon,
    File,
    Archive,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';

interface AdminDashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    stats: {
        total_users: number;
        total_documents: number;
        total_final_submissions: number;
        total_saved_documents: number;
        pending_reviews: number;
        approved_documents: number;
        rejected_documents: number;
        published_documents: number;
        verified_final: number;
        archived_final: number;
        pending_final: number;
    };
    userAnalytics: {
        total: number;
        students: number;
        faculty: number;
        admins: number;
        verified_users: number;
        unverified_users: number;
        new_this_week: number;
        new_this_month: number;
    };
    documentAnalytics: {
        total: number;
        by_status: {
            draft: number;
            pending_review: number;
            under_review: number;
            approved: number;
            rejected: number;
            published: number;
        };
        total_views: number;
        total_downloads: number;
        total_citations: number;
        most_viewed: Array<{
            id: number;
            title: string;
            views: number;
            downloads: number;
        }>;
        most_downloaded: Array<{
            id: number;
            title: string;
            views: number;
            downloads: number;
        }>;
        new_this_week: number;
        new_this_month: number;
    };
    finalAnalytics: {
        total: number;
        pending: number;
        verified: number;
        archived: number;
        new_this_week: number;
        new_this_month: number;
    };
    recentActivities: Array<{
        type: string;
        user: string;
        user_role: string;
        action: string;
        title: string;
        status: string;
        created_at: string;
        timestamp: string;
    }>;
    dailyActivity: Array<{
        date: string;
        label: string;
        documents: number;
        users: number;
        final_submissions: number;
        saves: number;
    }>;
    topUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        documents_count: number;
        reviews_count: number;
        total_activity: number;
    }>;
    roleDistribution: {
        students: number;
        faculty: number;
        admin: number;
    };
    storageUsage: string;
}

const STATUS_COLORS = {
    draft: '#6C6863',
    pending_review: '#E67E22',
    under_review: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
    published: '#3B82F6',
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    user,
    stats,
    userAnalytics,
    documentAnalytics,
    finalAnalytics,
    recentActivities,
    dailyActivity,
    topUsers,
    roleDistribution,
    storageUsage,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'verified':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending_review':
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'published':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'archived':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'verified':
                return <CheckCircle className="h-3 w-3" />;
            case 'pending_review':
            case 'pending':
                return <Clock className="h-3 w-3" />;
            case 'rejected':
                return <Activity className="h-3 w-3" />;
            case 'published':
                return <File className="h-3 w-3" />;
            case 'archived':
                return <Archive className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Shield className="h-3 w-3" />;
            case 'faculty':
                return <Award className="h-3 w-3" />;
            default:
                return <User className="h-3 w-3" />;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document_upload':
                return <FileText className="h-4 w-4 text-[#D4AF37]" />;
            case 'final_submission':
                return <Award className="h-4 w-4 text-[#10B981]" />;
            case 'user_registration':
                return <UserPlus className="h-4 w-4 text-[#3B82F6]" />;
            default:
                return <Activity className="h-4 w-4 text-[#6C6863]" />;
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            change: `+${userAnalytics.new_this_week} this week`,
            bgClass: 'border-t-[#1A1A1A]',
        },
        {
            title: 'Total Documents',
            value: stats.total_documents,
            icon: FileText,
            change: `+${documentAnalytics.new_this_week} this week`,
            bgClass: 'border-t-[#D4AF37]',
        },
        {
            title: 'Pending Reviews',
            value: stats.pending_reviews,
            icon: Clock,
            change: `${stats.pending_reviews} waiting`,
            bgClass: 'border-t-[#E67E22]',
        },
        {
            title: 'Final Submissions',
            value: stats.total_final_submissions,
            icon: Award,
            change: `${stats.verified_final} verified`,
            bgClass: 'border-t-[#10B981]',
        },
        {
            title: 'Total Views',
            value: documentAnalytics.total_views.toLocaleString(),
            icon: EyeIcon,
            change: 'All time views',
            bgClass: 'border-t-[#3B82F6]',
        },
    ];

    const maxActivity = Math.max(
        ...dailyActivity.map((d) =>
            Math.max(d.documents, d.users, d.final_submissions, d.saves),
        ),
    );

    const documentStatusData = Object.entries(
        documentAnalytics.by_status,
    ).filter(([_, value]) => value > 0);
    const totalStatus = documentStatusData.reduce(
        (sum, [_, value]) => sum + value,
        0,
    );

    return (
        <AppLayout>
            <Head title="Admin Dashboard - ASC KnowledgeVault" />

            {/* Page Header */}
            <div className="mb-10">
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-px w-8 bg-[#D4AF37]" />
                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                        Administrator Portal
                    </span>
                </div>
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="font-playfair mb-4 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                            System Dashboard
                        </h1>
                        <p className="max-w-2xl font-sans text-base leading-relaxed text-[#6C6863]">
                            Welcome back, {user.name}. Here's a comprehensive
                            overview of the KnowledgeVault system including
                            analytics, user activity, and document metrics.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded border border-[#1A1A1A]/20 px-3 py-1.5 text-xs text-[#6C6863] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        >
                            <Activity className="mr-1 inline h-3 w-3" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className={`group ${card.bgClass} border-t-2 pt-3 transition-all duration-700 hover:bg-[#F9F8F6]/50`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        {card.title}
                                    </p>
                                    <p className="font-playfair text-xl text-[#1A1A1A] lg:text-2xl">
                                        {card.value}
                                    </p>
                                    {card.change && (
                                        <p className="text-[9px] text-[#6C6863]">
                                            {card.change}
                                        </p>
                                    )}
                                </div>
                                <div className="border border-[#1A1A1A]/10 p-1.5 transition-all duration-500 group-hover:border-[#D4AF37]">
                                    <Icon className="h-3 w-3 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Recent Activity */}
            <div className="mb-4 border border-[#1A1A1A]/10 p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <div className="h-px w-5 bg-[#D4AF37]" />
                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                Timeline Feed
                            </span>
                        </div>
                        <h3 className="font-playfair text-base text-[#1A1A1A]">
                            Recent System Activity
                        </h3>
                    </div>
                    <Link
                        href="/admin/activities"
                        className="text-xs text-[#D4AF37] hover:underline"
                    >
                        View All
                    </Link>
                </div>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 border-b border-[#1A1A1A]/5 pb-2 last:border-0"
                            >
                                <div className="mt-0.5">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-sans text-xs text-[#1A1A1A]">
                                        <span className="font-medium">
                                            {activity.user}
                                        </span>{' '}
                                        {activity.action}{' '}
                                        <span className="font-playfair text-[#D4AF37]">
                                            "
                                            {activity.title.length > 30
                                                ? activity.title.substring(
                                                      0,
                                                      30,
                                                  ) + '...'
                                                : activity.title}
                                            "
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] ${getStatusColor(activity.status)}`}
                                        >
                                            {getStatusIcon(activity.status)}
                                            {activity.status}
                                        </span>
                                        <span className="text-[9px] text-[#6C6863]">
                                            {activity.created_at}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-[#6C6863]">
                            No recent activity
                        </p>
                    )}
                </div>
            </div>
            {/* Charts Row - CSS based */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {/* Daily Activity Chart (CSS Bar Chart) */}
                {/* <div className="border border-[#1A1A1A]/10 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <div className="h-px w-5 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Activity Overview
                                </span>
                            </div>
                            <h3 className="font-playfair text-base text-[#1A1A1A]">
                                Daily Activity (Last 30 Days)
                            </h3>
                        </div>
                    </div>
                    <div className="h-48">
                        <div className="flex h-full items-end gap-1">
                            {dailyActivity.slice(-14).map((day, index) => {
                                const height =
                                    maxActivity > 0
                                        ? (day.documents / maxActivity) * 100
                                        : 0;
                                const userHeight =
                                    maxActivity > 0
                                        ? (day.users / maxActivity) * 100
                                        : 0;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div className="relative w-full flex-1">
                                            <div
                                                className="absolute bottom-0 w-full bg-[#1A1A1A] transition-all duration-500"
                                                style={{
                                                    height: `${userHeight * 0.8}%`,
                                                    opacity: 0.3,
                                                }}
                                            />
                                            <div
                                                className="absolute bottom-0 w-full bg-[#D4AF37] transition-all duration-500"
                                                style={{
                                                    height: `${height * 0.8}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[8px] text-[#6C6863]">
                                            {day.label.slice(0, 3)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-center gap-4 text-xs text-[#6C6863]">
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-4 bg-[#D4AF37]" />
                            Documents
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-4 bg-[#1A1A1A]" />
                            Users
                        </span>
                    </div>
                </div> */}

                <div className="border border-[#1A1A1A]/10 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <div className="h-px w-5 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Popular Content
                                </span>
                            </div>
                            <h3 className="font-playfair text-base text-[#1A1A1A]">
                                Most Viewed Documents
                            </h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {documentAnalytics.most_viewed.length > 0 ? (
                            documentAnalytics.most_viewed.map((doc, index) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-[#D4AF37]">
                                            #{index + 1}
                                        </span>
                                        <span className="max-w-[150px] truncate font-sans text-sm text-[#1A1A1A]">
                                            {doc.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#6C6863]">
                                        <span className="flex items-center gap-1">
                                            <EyeIcon className="h-3 w-3" />
                                            {doc.views}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-[#6C6863]">
                                No documents yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Document Status Distribution */}
                <div className="border border-[#1A1A1A]/10 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <div className="h-px w-5 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Document Status
                                </span>
                            </div>
                            <h3 className="font-playfair text-base text-[#1A1A1A]">
                                Status Distribution
                            </h3>
                        </div>
                        <span className="text-xs text-[#6C6863]">
                            Total: {documentAnalytics.total}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {documentStatusData.map(([key, value]) => {
                            const percentage =
                                totalStatus > 0
                                    ? (value / totalStatus) * 100
                                    : 0;
                            const label = key
                                .split('_')
                                .map(
                                    (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                )
                                .join(' ');
                            const color =
                                STATUS_COLORS[
                                    key as keyof typeof STATUS_COLORS
                                ] || '#6C6863';
                            return (
                                <div key={key}>
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-[#6C6863]">
                                            {label}
                                        </span>
                                        <span className="text-[#1A1A1A]">
                                            {value}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden bg-[#EBE5DE]">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Documents & Top Users */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {/* Most Viewed Documents */}

                {/* User Analytics & Recent Activity */}
                <div className="grid gap-6">
                    {/* User Analytics */}
                    <div className="border border-[#1A1A1A]/10 p-5 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-px w-5 bg-[#D4AF37]" />
                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                User Analytics
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                <span className="font-sans text-sm text-[#6C6863]">
                                    Total Users
                                </span>
                                <span className="font-playfair text-lg text-[#1A1A1A]">
                                    {userAnalytics.total}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                <span className="font-sans text-sm text-[#6C6863]">
                                    Students
                                </span>
                                <span className="font-playfair text-lg text-[#1A1A1A]">
                                    {userAnalytics.students}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                <span className="font-sans text-sm text-[#6C6863]">
                                    Faculty
                                </span>
                                <span className="font-playfair text-lg text-[#D4AF37]">
                                    {userAnalytics.faculty}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                <span className="font-sans text-sm text-[#6C6863]">
                                    Admins
                                </span>
                                <span className="font-playfair text-lg text-[#1A1A1A]">
                                    {userAnalytics.admins}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="text-center">
                        <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                            Storage Used
                        </p>
                        <p className="font-playfair text-xl text-[#1A1A1A]">
                            {storageUsage}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                            Saved Documents
                        </p>
                        <p className="font-playfair text-xl text-[#1A1A1A]">
                            {stats.total_saved_documents}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                            Final Papers
                        </p>
                        <p className="font-playfair text-xl text-[#D4AF37]">
                            {stats.total_final_submissions}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AdminDashboard;
