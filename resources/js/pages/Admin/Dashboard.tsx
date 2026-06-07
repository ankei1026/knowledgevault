// resources/js/Pages/Admin/Dashboard.tsx

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
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';

// Mock Data
const mockStats = {
    total_users: 1, // You + 0 others for now
    total_documents: 0,
    pending_reviews: 0,
    approved_documents: 0,
    rejected_documents: 0,
    storage_used: '0 MB',
    active_users_today: 1,
    documents_this_month: 0,
};

const mockRecentUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@asc.edu.ph',
        role: 'admin',
        created_at: 'Just now',
        status: 'active',
    },
];

const mockRecentDocuments: Array<{
    id: number;
    title: string;
    author: string;
    status: string;
    created_at: string;
    views: number;
    downloads: number;
}> = [];

const mockDocumentStatus = {
    draft: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
};

const mockRoleDistribution = {
    students: 0,
    faculty: 0,
    admin: 1,
};

// Sample data for when documents are added
const sampleDocuments = [
    {
        id: 101,
        title: 'AI in Modern Education: A Comprehensive Study',
        author: 'Dr. Maria Santos',
        status: 'approved',
        created_at: '2 days ago',
        views: 45,
        downloads: 12,
    },
    {
        id: 102,
        title: 'Blockchain Technology for Academic Records',
        author: 'Prof. Juan Dela Cruz',
        status: 'pending_review',
        created_at: '3 days ago',
        views: 23,
        downloads: 5,
    },
    {
        id: 103,
        title: 'Sustainable Development in Higher Education',
        author: 'Dr. Ana Reyes',
        status: 'approved',
        created_at: '5 days ago',
        views: 67,
        downloads: 23,
    },
    {
        id: 104,
        title: 'Digital Transformation in Philippine Universities',
        author: 'Prof. Carlos Mendoza',
        status: 'rejected',
        created_at: '1 week ago',
        views: 12,
        downloads: 3,
    },
];

const AdminDashboard: React.FC = () => {
    const [user] = useState({
        id: 1,
        name: 'Admin User',
        email: 'admin@asc.edu.ph',
        role: 'admin',
    });

    const [stats] = useState(mockStats);
    const [recentUsers] = useState(mockRecentUsers);
    const [recentDocuments, setRecentDocuments] = useState(mockRecentDocuments);
    const [documentStatus, setDocumentStatus] = useState(mockDocumentStatus);
    const [roleDistribution] = useState(mockRoleDistribution);
    const [showSampleData, setShowSampleData] = useState(false);

    // Load sample data for demo purposes
    const loadSampleData = () => {
        setRecentDocuments(sampleDocuments);
        setDocumentStatus({
            draft: 2,
            pending_review: 1,
            approved: 2,
            rejected: 1,
        });
        setShowSampleData(true);
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            change: showSampleData ? '+25%' : '',
            bgClass: 'border-t-[#1A1A1A]',
        },
        {
            title: 'Documents',
            value: showSampleData
                ? sampleDocuments.length
                : stats.total_documents,
            icon: FileText,
            change: showSampleData ? '+6' : '',
            bgClass: 'border-t-[#D4AF37]',
        },
        {
            title: 'Pending Reviews',
            value: showSampleData
                ? documentStatus.pending_review
                : stats.pending_reviews,
            icon: Clock,
            change: showSampleData ? '+1' : '',
            bgClass: 'border-t-[#E67E22]',
        },
        {
            title: 'Storage Used',
            value: showSampleData ? '156 MB' : stats.storage_used,
            icon: HardDrive,
            change: '',
            bgClass: 'border-t-[#6C6863]',
        },
    ];

    const getStatusColor = (status: string) => {
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
                return <Activity className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_review':
                return 'Pending';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    return (
        <AppLayout>
            <Head title="Admin Dashboard - ASC KnowledgeVault" />

            <style>{`
                .drop-cap::first-letter {
                    font-family: 'Playfair Display', serif;
                    font-size: 4rem;
                    font-weight: 400;
                    float: left;
                    line-height: 0.8;
                    margin-right: 0.5rem;
                    color: #D4AF37;
                }

                .stat-card {
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }
            `}</style>

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
                        <p className="drop-cap max-w-2xl font-sans text-base leading-relaxed text-[#6C6863]">
                            Welcome back, {user.name}. Here's an overview of the
                            KnowledgeVault system activity, user engagement, and
                            document management metrics.
                        </p>
                    </div>
                    {!showSampleData && (
                        <button
                            onClick={loadSampleData}
                            className="group relative h-11 overflow-hidden border border-[#D4AF37] bg-transparent px-6 transition-all duration-500 hover:bg-[#D4AF37]"
                        >
                            <span className="relative z-10 flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-[#D4AF37] transition-colors duration-500 group-hover:text-white">
                                <Database className="h-3 w-3" />
                                Load Sample Data
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className={`stat-card group border-t-2 ${card.bgClass} pt-5 transition-all duration-700 hover:bg-[#F9F8F6]/50`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        {card.title}
                                    </p>
                                    <p className="font-playfair mb-1 text-3xl text-[#1A1A1A] lg:text-4xl">
                                        {card.value}
                                    </p>
                                    {card.change && (
                                        <p className="flex items-center gap-1 font-sans text-xs text-green-600">
                                            <TrendingUp className="h-3 w-3" />
                                            {card.change}
                                        </p>
                                    )}
                                </div>
                                <div className="border border-[#1A1A1A]/10 p-3 transition-all duration-500 group-hover:border-[#D4AF37]">
                                    <Icon className="h-5 w-5 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Welcome Message - When no data */}
            {!showSampleData && (
                <div className="mb-12 border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-8 text-center">
                    <div className="mx-auto max-w-md">
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-[#D4AF37]/10 p-3">
                                <Database className="h-8 w-8 text-[#D4AF37]" />
                            </div>
                        </div>
                        <h3 className="font-playfair mb-2 text-xl text-[#1A1A1A]">
                            Your KnowledgeVault is Ready
                        </h3>
                        <p className="mb-4 font-sans text-sm text-[#6C6863]">
                            Start by uploading your first document, adding
                            users, or explore the system with sample data.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/documents/upload"
                                className="group relative h-10 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                            >
                                <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 group-hover:translate-x-0" />
                                <span className="relative z-10 flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-white">
                                    <FileText className="h-3 w-3" />
                                    Upload Document
                                </span>
                            </Link>
                            <Link
                                href="/admin/users"
                                className="flex h-10 items-center gap-2 border border-[#1A1A1A] px-6 font-sans text-xs tracking-[0.2em] text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                            >
                                <UserPlus className="h-3 w-3" />
                                Add Users
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Two Column Layout - Only show when there's data */}
            {showSampleData && (
                <div className="mb-12 grid gap-8 lg:grid-cols-12">
                    {/* Left Column */}
                    <div className="lg:col-span-7">
                        {/* Document Status Distribution */}
                        <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-px w-6 bg-[#D4AF37]" />
                                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                            Document Status
                                        </span>
                                    </div>
                                    <h3 className="font-playfair text-xl text-[#1A1A1A]">
                                        Distribution Overview
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]">
                                        <Filter className="h-4 w-4" />
                                    </button>
                                    <button className="p-1.5 text-[#6C6863] transition-colors hover:text-[#D4AF37]">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(documentStatus).map(
                                    ([key, value]) => {
                                        const total = Object.values(
                                            documentStatus,
                                        ).reduce((a, b) => a + b, 0);
                                        const percentage =
                                            total > 0
                                                ? (value / total) * 100
                                                : 0;
                                        const colors = {
                                            approved: 'bg-green-500',
                                            pending_review: 'bg-yellow-500',
                                            draft: 'bg-[#6C6863]',
                                            rejected: 'bg-red-500',
                                        };
                                        const labels = {
                                            approved: 'Approved',
                                            pending_review: 'Pending Review',
                                            draft: 'Draft',
                                            rejected: 'Rejected',
                                        };
                                        return (
                                            <div key={key}>
                                                <div className="mb-2 flex justify-between font-sans text-sm">
                                                    <span className="text-[#6C6863]">
                                                        {
                                                            labels[
                                                                key as keyof typeof labels
                                                            ]
                                                        }
                                                    </span>
                                                    <span className="font-medium text-[#1A1A1A]">
                                                        {value}
                                                    </span>
                                                </div>
                                                <div className="h-1 overflow-hidden bg-[#EBE5DE]">
                                                    <div
                                                        className={`h-full ${colors[key as keyof typeof colors]} transition-all duration-1000`}
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>

                        {/* Recent Documents */}
                        <div className="border border-[#1A1A1A]/10 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-px w-6 bg-[#D4AF37]" />
                                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                            Recent Activity
                                        </span>
                                    </div>
                                    <h3 className="font-playfair text-xl text-[#1A1A1A]">
                                        Latest Documents
                                    </h3>
                                </div>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-[#6C6863]" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        className="border border-[#1A1A1A]/10 py-1.5 pr-3 pl-8 text-xs focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recentDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="group border-b border-[#1A1A1A]/10 pb-3 transition-all duration-500 last:border-0 hover:pl-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-playfair text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                                        {doc.title}
                                                    </h4>
                                                    <span
                                                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] ${getStatusColor(doc.status)}`}
                                                    >
                                                        {getStatusIcon(
                                                            doc.status,
                                                        )}
                                                        {getStatusLabel(
                                                            doc.status,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="font-sans text-xs text-[#6C6863]">
                                                    {doc.author}
                                                </p>
                                                <div className="mt-1 flex gap-3">
                                                    <span className="font-sans text-[10px] text-[#6C6863]">
                                                        👁️ {doc.views} views
                                                    </span>
                                                    <span className="font-sans text-[10px] text-[#6C6863]">
                                                        ⬇️ {doc.downloads}{' '}
                                                        downloads
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-sans text-[10px] text-[#6C6863]">
                                                    {doc.created_at}
                                                </p>
                                                <button className="mt-1 p-1 text-[#6C6863] transition-colors hover:text-[#D4AF37]">
                                                    <MoreVertical className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {recentDocuments.length === 0 && (
                                <div className="py-8 text-center">
                                    <FileText className="mx-auto h-8 w-8 text-[#6C6863]/30" />
                                    <p className="mt-2 font-sans text-sm text-[#6C6863]">
                                        No documents yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-5">
                        {/* Role Distribution */}
                        <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="h-px w-6 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Community
                                </span>
                            </div>
                            <h3 className="font-playfair mb-6 text-xl text-[#1A1A1A]">
                                User Distribution
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border border-[#1A1A1A]/10 p-3 transition-all duration-500 hover:border-[#D4AF37]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center bg-[#1A1A1A]/10">
                                            <Users className="h-4 w-4 text-[#1A1A1A]" />
                                        </div>
                                        <div>
                                            <p className="font-sans text-sm text-[#1A1A1A]">
                                                Students
                                            </p>
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                Researchers & Authors
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                                        {roleDistribution.students}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border border-[#1A1A1A]/10 p-3 transition-all duration-500 hover:border-[#D4AF37]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center bg-[#D4AF37]/10">
                                            <Award className="h-4 w-4 text-[#D4AF37]" />
                                        </div>
                                        <div>
                                            <p className="font-sans text-sm text-[#1A1A1A]">
                                                Faculty
                                            </p>
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                Reviewers & Advisors
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                                        {roleDistribution.faculty}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border border-[#1A1A1A]/10 bg-[#F9F8F6] p-3 transition-all duration-500 hover:border-[#D4AF37]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center bg-[#1A1A1A]">
                                            <Activity className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-sans text-sm text-[#1A1A1A]">
                                                Administrators
                                            </p>
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                System Managers
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                                        {roleDistribution.admin}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-px w-6 bg-[#D4AF37]" />
                                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                            New Members
                                        </span>
                                    </div>
                                    <h3 className="font-playfair text-xl text-[#1A1A1A]">
                                        Recent Signups
                                    </h3>
                                </div>
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-1 font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                >
                                    Manage <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentUsers.map((recentUser) => (
                                    <div
                                        key={recentUser.id}
                                        className="flex items-center justify-between border-b border-[#1A1A1A]/10 py-2 transition-all duration-500 last:border-0 hover:pl-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center border border-[#1A1A1A]/20">
                                                <span className="font-playfair text-xs text-[#1A1A1A]">
                                                    {recentUser.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-sans text-sm text-[#1A1A1A]">
                                                    {recentUser.name}
                                                </p>
                                                <p className="font-sans text-xs text-[#6C6863]">
                                                    {recentUser.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase">
                                                {recentUser.role}
                                            </span>
                                            <p className="mt-1 font-sans text-[10px] text-[#6C6863]">
                                                {recentUser.created_at}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="border border-[#1A1A1A]/10 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="h-px w-6 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Quick Actions
                                </span>
                            </div>
                            <h3 className="font-playfair mb-4 text-xl text-[#1A1A1A]">
                                Administrative Tasks
                            </h3>

                            <div className="space-y-3">
                                <Link
                                    href="/admin/users"
                                    className="group flex items-center justify-between border border-[#1A1A1A]/10 p-3 transition-all duration-500 hover:border-[#D4AF37]"
                                >
                                    <span className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                        Manage Users
                                    </span>
                                    <UserPlus className="h-4 w-4 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                </Link>
                                <Link
                                    href="/admin/documents"
                                    className="group flex items-center justify-between border border-[#1A1A1A]/10 p-3 transition-all duration-500 hover:border-[#D4AF37]"
                                >
                                    <span className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                        Review All Documents
                                    </span>
                                    <BookOpen className="h-4 w-4 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className="group flex items-center justify-between border border-[#1A1A1A]/10 p-3 transition-all duration-500 hover:border-[#D4AF37]"
                                >
                                    <span className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                        System Settings
                                    </span>
                                    <Database className="h-4 w-4 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Activity Summary */}
            {showSampleData && (
                <div className="mt-4 border-t border-[#1A1A1A]/10 pt-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex items-center gap-4 transition-all duration-500 hover:pl-2">
                            <div className="bg-[#D4AF37]/10 p-3 transition-all duration-500 group-hover:bg-[#D4AF37]/20">
                                <Calendar className="h-5 w-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Documents This Month
                                </p>
                                <p className="font-playfair text-2xl text-[#1A1A1A]">
                                    {stats.documents_this_month + 6}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 transition-all duration-500 hover:pl-2">
                            <div className="bg-[#D4AF37]/10 p-3 transition-all duration-500 group-hover:bg-[#D4AF37]/20">
                                <Activity className="h-5 w-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Active Users Today
                                </p>
                                <p className="font-playfair text-2xl text-[#1A1A1A]">
                                    {stats.active_users_today}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 transition-all duration-500 hover:pl-2">
                            <div className="bg-[#D4AF37]/10 p-3 transition-all duration-500 group-hover:bg-[#D4AF37]/20">
                                <CheckCircle className="h-5 w-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Approval Rate
                                </p>
                                <p className="font-playfair text-2xl text-[#1A1A1A]">
                                    {Math.round(
                                        (documentStatus.approved /
                                            Object.values(
                                                documentStatus,
                                            ).reduce((a, b) => a + b, 0)) *
                                            100,
                                    )}
                                    %
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default AdminDashboard;
