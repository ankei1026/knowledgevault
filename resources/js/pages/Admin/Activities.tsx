// resources/js/Pages/Admin/Activities.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    Activity,
    FileText,
    UserPlus,
    Award,
    Bookmark,
    Clock,
    CheckCircle,
    XCircle,
    Archive,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    File,
    Eye,
    Download,
    Zap,
    RefreshCw,
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
import { Label } from '@/components/ui/label';

interface Activity {
    id: number;
    type: string;
    user: string;
    user_role: string;
    user_id: number;
    action: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    timestamp: string;
    metadata?: any;
}

interface ActivitiesProps {
    activities: {
        data: Activity[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        documents: number;
        users: number;
        final_submissions: number;
        saved_documents: number;
        today: number;
        this_week: number;
        this_month: number;
    };
    activityTypes: Record<string, string>;
    filters: {
        type: string;
        search: string;
        date_from: string;
        date_to: string;
    };
}

const AdminActivities: React.FC<ActivitiesProps> = ({
    activities,
    stats,
    activityTypes,
    filters: initialFilters,
}) => {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [activityType, setActivityType] = useState(
        initialFilters.type || 'all',
    );
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const applyFilters = () => {
        router.get(
            '/admin/activities',
            {
                search: searchTerm,
                type: activityType,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActivityType('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/activities', {}, { preserveState: true });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document_upload':
                return <FileText className="h-4 w-4 text-[#D4AF37]" />;
            case 'document_update':
                return <File className="h-4 w-4 text-[#3B82F6]" />;
            case 'document_delete':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'final_submission':
                return <Award className="h-4 w-4 text-[#10B981]" />;
            case 'final_verification':
                return <CheckCircle className="h-4 w-4 text-[#10B981]" />;
            case 'final_archive':
                return <Archive className="h-4 w-4 text-[#6C6863]" />;
            case 'user_registration':
                return <UserPlus className="h-4 w-4 text-[#3B82F6]" />;
            case 'user_login':
                return <User className="h-4 w-4 text-[#6C6863]" />;
            case 'user_update':
                return <Edit className="h-4 w-4 text-[#F59E0B]" />;
            case 'user_delete':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'saved_document':
                return <Bookmark className="h-4 w-4 text-[#D4AF37]" />;
            case 'unsaved_document':
                return <Bookmark className="h-4 w-4 text-red-400" />;
            case 'review_submitted':
                return <CheckCircle className="h-4 w-4 text-[#10B981]" />;
            case 'document_view':
                return <Eye className="h-4 w-4 text-[#3B82F6]" />;
            case 'document_download':
                return <Download className="h-4 w-4 text-[#D4AF37]" />;
            default:
                return <Activity className="h-4 w-4 text-[#6C6863]" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
            case 'approved':
            case 'published':
            case 'active':
            case 'saved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'pending':
            case 'pending_review':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected':
            case 'archived':
            case 'inactive':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'unverified':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
            case 'approved':
            case 'published':
            case 'active':
                return <CheckCircle className="h-3 w-3" />;
            case 'pending':
            case 'pending_review':
                return <Clock className="h-3 w-3" />;
            case 'rejected':
            case 'archived':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Activity className="h-3 w-3" />;
        }
    };

    const getStatusLabel = (status: string) => {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const statCards = [
        {
            label: 'Total Activities',
            value: stats.total.toLocaleString(),
            icon: Activity,
            color: '#1A1A1A',
        },
        {
            label: 'Today',
            value: stats.today,
            icon: Calendar,
            color: '#D4AF37',
        },
        {
            label: 'This Week',
            value: stats.this_week,
            icon: Zap,
            color: '#F59E0B',
        },
        {
            label: 'This Month',
            value: stats.this_month,
            icon: Calendar,
            color: '#3B82F6',
        },
    ];

    return (
        <AppLayout>
            <Head title="Activity Log - ASC KnowledgeVault" />

            <div className="mb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            System Logs
                        </span>
                    </div>
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                                Activity Log
                            </h1>
                            <p className="font-sans text-base text-[#6C6863]">
                                Monitor all system activities, user actions, and
                                document events.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.reload()}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="border-t-2 pt-3 transition-all duration-700 hover:bg-[#F9F8F6]/50"
                                style={{ borderTopColor: card.color }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="mb-1 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                            {card.label}
                                        </p>
                                        <p className="font-playfair text-2xl text-[#1A1A1A] lg:text-3xl">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className="border border-[#1A1A1A]/10 p-2 transition-all duration-500">
                                        <Icon className="h-4 w-4 text-[#6C6863]" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            placeholder="Search by user, action, or title..."
                            className="pl-9"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>

                    <Button onClick={applyFilters}>Apply</Button>

                    <Button variant="ghost" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mb-6 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F8F6] p-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label className="mb-2 block">
                                    Activity Type
                                </Label>
                                <Select
                                    value={activityType}
                                    onValueChange={setActivityType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Activities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Activities
                                        </SelectItem>
                                        {Object.entries(activityTypes).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Date From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Date To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Activities List */}
                <div className="space-y-3">
                    {activities.data.length > 0 ? (
                        activities.data.map((activity) => (
                            <div
                                key={`${activity.type}-${activity.id}`}
                                className="border border-[#1A1A1A]/10 bg-white p-4 transition-all hover:border-[#D4AF37] hover:shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <p className="font-sans text-sm text-[#1A1A1A]">
                                                    <span className="font-medium">
                                                        {activity.user}
                                                    </span>{' '}
                                                    <span className="text-[#6C6863]">
                                                        {activity.action}
                                                    </span>{' '}
                                                    <span className="font-playfair text-[#D4AF37]">
                                                        "{activity.title}"
                                                    </span>
                                                </p>
                                                {activity.description && (
                                                    <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                                        {activity.description}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${getStatusBadge(activity.status)}`}
                                                    >
                                                        {getStatusIcon(
                                                            activity.status,
                                                        )}
                                                        {getStatusLabel(
                                                            activity.status,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-[#6C6863]">
                                                        • {activity.created_at}
                                                    </span>
                                                    {activity.metadata
                                                        ?.views !==
                                                        undefined && (
                                                        <span className="flex items-center gap-1 text-xs text-[#6C6863]">
                                                            <Eye className="h-3 w-3" />
                                                            {
                                                                activity
                                                                    .metadata
                                                                    .views
                                                            }
                                                        </span>
                                                    )}
                                                    {activity.metadata
                                                        ?.downloads !==
                                                        undefined && (
                                                        <span className="flex items-center gap-1 text-xs text-[#6C6863]">
                                                            <Download className="h-3 w-3" />
                                                            {
                                                                activity
                                                                    .metadata
                                                                    .downloads
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                                    {activity.type
                                                        .split('_')
                                                        .map(
                                                            (word) =>
                                                                word
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                word.slice(1),
                                                        )
                                                        .join(' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <Activity className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                            <p className="mt-3 font-sans text-[#6C6863]">
                                No activities found
                            </p>
                            <p className="font-sans text-sm text-[#6C6863]/60">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="font-sans text-sm text-[#6C6863]">
                            Showing {activities.data.length} of{' '}
                            {activities.total} activities
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/activities', {
                                        page: activities.current_page - 1,
                                        search: searchTerm,
                                        type: activityType,
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                    })
                                }
                                disabled={activities.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="flex h-8 items-center justify-center px-3 font-sans text-sm text-[#1A1A1A]">
                                Page {activities.current_page} of{' '}
                                {activities.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/activities', {
                                        page: activities.current_page + 1,
                                        search: searchTerm,
                                        type: activityType,
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                    })
                                }
                                disabled={
                                    activities.current_page ===
                                    activities.last_page
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

export default AdminActivities;
