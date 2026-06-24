// resources/js/Pages/Student/MyManuscriptDetail.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    ChevronLeft,
    Eye,
    Download,
    Edit,
    Trash2,
    Send,
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    User,
    Calendar,
    Tag,
    Users,
    Mail,
    MessageSquare,
    ChevronDown,
    MoreVertical,
    Award,
    TrendingUp,
    BookOpen,
    UserPlus,
    X,
    Plus,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Document {
    id: number;
    title: string;
    abstract: string | null;
    description: string | null;
    keywords: string[] | null;
    status: string;
    views: number;
    downloads: number;
    citations: number;
    created_at: string;
    updated_at: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    reviewer_feedback: string | null;
    file_path: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
    collaborators: Array<{
        id: number;
        name: string;
        email: string;
        pivot: { role: string; status: string };
    }>;
    reviewer: { id: number; name: string; email: string } | null;
}

interface ReviewHistory {
    id: number;
    reviewer_id: number;
    document_id: number;
    rating: number | null;
    feedback: string | null;
    status: string;
    created_at: string;
    reviewer: {
        id: number;
        name: string;
        email: string;
    };
}

interface MyManuscriptDetailProps {
    document: Document;
    reviewHistory: ReviewHistory[];
    stats: {
        views: number;
        downloads: number;
        citations: number;
        submitted_at: string | null;
        reviewed_at: string | null;
    };
}

const MyManuscriptDetail: React.FC<MyManuscriptDetailProps> = ({
    document,
    reviewHistory,
    stats,
}) => {
    const [showAddCollaboratorModal, setShowAddCollaboratorModal] =
        useState(false);
    const [collaboratorName, setCollaboratorName] = useState('');
    const [collaboratorEmail, setCollaboratorEmail] = useState('');
    const [collaboratorRole, setCollaboratorRole] = useState('co-author');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'approved':
                return 'text-blue-600 bg-blue-50 border-blue-200';
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
            case 'published':
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending_review':
                return <Clock className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published':
                return 'Published';
            case 'approved':
                return 'Approved';
            case 'pending_review':
                return 'Pending Review';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Draft';
        }
    };

    const handleDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete "${document.title}"? This action cannot be undone.`,
            )
        ) {
            router.delete(`/student/my-manuscripts/${document.id}`, {
                onSuccess: () => {
                    toast.success('Manuscript deleted');
                    router.visit('/student/my-manuscripts');
                },
                onError: () => {
                    toast.error('Failed to delete manuscript');
                },
            });
        }
    };

    const handleSubmitForReview = () => {
        if (confirm(`Submit "${document.title}" for review?`)) {
            router.post(
                `/student/my-manuscripts/${document.id}/submit`,
                {},
                {
                    onSuccess: () => {
                        toast.success('Manuscript submitted for review');
                    },
                    onError: () => {
                        toast.error('Failed to submit manuscript');
                    },
                },
            );
        }
    };

    const handleSubmitFinalPaper = () => {
        if (
            confirm(
                `Submit "${document.title}" as a final paper? This will publish it to the repository.`,
            )
        ) {
            router.post(
                `/student/my-manuscripts/${document.id}/submit-final`,
                {},
                {
                    onSuccess: () => {
                        toast.success('Manuscript published successfully!');
                    },
                    onError: () => {
                        toast.error('Failed to publish manuscript');
                    },
                },
            );
        }
    };

    const handleAddCollaborator = (e: React.FormEvent) => {
        e.preventDefault();
        // Non-functional - just UI demo
        toast.success('Collaborator added successfully!');
        setShowAddCollaboratorModal(false);
        setCollaboratorName('');
        setCollaboratorEmail('');
    };

    const roles = [
        { value: 'co-author', label: 'Co-author' },
        { value: 'reviewer', label: 'Reviewer' },
        { value: 'viewer', label: 'Viewer' },
    ];

    return (
        <AppLayout>
            <Head title={`${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-6xl">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href="/student/my-manuscripts"
                        className="inline-flex items-center gap-2 font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to My Manuscripts
                    </Link>
                </div>

                {/* Document Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Manuscript
                                </span>
                            </div>
                            <h1 className="font-playfair text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                                {document.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex items-center gap-2 rounded border px-3 py-1 font-sans text-sm ${getStatusBadge(document.status)}`}
                            >
                                {getStatusIcon(document.status)}
                                {getStatusLabel(document.status)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#6C6863]">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-sans">
                                {document.user.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-sans">
                                Created{' '}
                                {new Date(
                                    document.created_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        {stats.submitted_at && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-sans">
                                    Submitted{' '}
                                    {new Date(
                                        stats.submitted_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span className="font-sans">
                                {stats.views} views
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span className="font-sans">
                                {stats.downloads} downloads
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-10 flex flex-wrap gap-3">
                    {document.status === 'draft' && (
                        <button
                            onClick={handleSubmitForReview}
                            className="group relative h-11 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                <Send className="h-4 w-4" />
                                Submit for Review
                            </span>
                        </button>
                    )}

                    {document.status === 'approved' && (
                        <button
                            onClick={handleSubmitFinalPaper}
                            className="group relative h-11 overflow-hidden bg-green-600 px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                <CheckCircle className="h-4 w-4" />
                                Publish as Final Paper
                            </span>
                        </button>
                    )}

                    <Link
                        href={`/student/my-manuscripts/${document.id}/edit`}
                        className="flex h-11 items-center border border-[#1A1A1A] px-6 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>

                    {document.file_path && (
                        <a
                            href={`/storage/${document.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-11 items-center border border-[#1A1A1A] px-6 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </a>
                    )}

                    {document.status === 'draft' && (
                        <button
                            onClick={handleDelete}
                            className="flex h-11 items-center border border-red-600 px-6 font-sans text-[11px] tracking-[0.2em] text-red-600 uppercase transition-all duration-500 hover:bg-red-600 hover:text-white"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </button>
                    )}
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8">
                        {/* Abstract */}
                        {document.abstract && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Abstract
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    {document.abstract}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {document.description && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Description
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    {document.description}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {document.keywords && document.keywords.length > 0 && (
                            <div className="mb-8 border border-[#1A1A1A]/10 p-6">
                                <h2 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    Keywords
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {document.keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#1A1A1A]"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Feedback */}
                        {document.reviewer_feedback && (
                            <div className="mb-8 border border-yellow-200 bg-yellow-50 p-6">
                                <h2 className="font-playfair mb-3 flex items-center gap-2 text-xl text-[#1A1A1A]">
                                    <MessageSquare className="h-5 w-5 text-yellow-600" />
                                    Reviewer Feedback
                                </h2>
                                <p className="font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                    {document.reviewer_feedback}
                                </p>
                                {document.reviewed_at && (
                                    <p className="mt-3 text-xs text-[#6C6863]">
                                        Reviewed on{' '}
                                        {new Date(
                                            document.reviewed_at,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                            <h3 className="font-playfair mb-4 text-lg text-[#1A1A1A]">
                                Document Info
                            </h3>

                            {/* Statistics */}
                            <div className="mb-6">
                                <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Statistics
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                        <span className="font-sans text-sm text-[#6C6863]">
                                            <Eye className="mr-2 inline h-3 w-3" />
                                            Views
                                        </span>
                                        <span className="font-playfair text-sm text-[#1A1A1A]">
                                            {stats.views}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                                        <span className="font-sans text-sm text-[#6C6863]">
                                            <Download className="mr-2 inline h-3 w-3" />
                                            Downloads
                                        </span>
                                        <span className="font-playfair text-sm text-[#1A1A1A]">
                                            {stats.downloads}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Co-authors / Groupmates */}
                            <div className="mb-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Co-authors / Groupmates
                                    </span>
                                    <button
                                        onClick={() =>
                                            setShowAddCollaboratorModal(true)
                                        }
                                        className="flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#1A1A1A]"
                                    >
                                        <UserPlus className="h-3 w-3" />
                                        Add
                                    </button>
                                </div>
                                {document.collaborators &&
                                document.collaborators.length > 0 ? (
                                    <div className="space-y-2">
                                        {document.collaborators.map(
                                            (collaborator) => (
                                                <div
                                                    key={collaborator.id}
                                                    className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-3 w-3 text-[#6C6863]" />
                                                        <span className="font-sans text-sm text-[#1A1A1A]">
                                                            {collaborator.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-[#6C6863]">
                                                            {
                                                                collaborator
                                                                    .pivot.role
                                                            }
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                toast.success(
                                                                    `${collaborator.name} removed from collaborators`,
                                                                );
                                                            }}
                                                            className="text-[#6C6863] transition-colors hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <Users className="mx-auto h-6 w-6 text-[#6C6863]/30" />
                                        <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                            No co-authors yet
                                        </p>
                                        <button
                                            onClick={() =>
                                                setShowAddCollaboratorModal(
                                                    true,
                                                )
                                            }
                                            className="mt-2 text-xs text-[#D4AF37] hover:underline"
                                        >
                                            Add co-authors
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Reviewer */}
                            {document.reviewer && (
                                <div className="mb-6">
                                    <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                        Assigned Reviewer
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-2">
                                        <User className="h-3 w-3 text-[#D4AF37]" />
                                        <span className="font-sans text-sm text-[#1A1A1A]">
                                            {document.reviewer.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div>
                                <div className="mb-2 font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase">
                                    Dates
                                </div>
                                <div className="space-y-1 text-sm text-[#6C6863]">
                                    <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-1">
                                        <span>Created</span>
                                        <span className="text-[#1A1A1A]">
                                            {new Date(
                                                document.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-1">
                                        <span>Updated</span>
                                        <span className="text-[#1A1A1A]">
                                            {new Date(
                                                document.updated_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {document.submitted_at && (
                                        <div className="flex justify-between">
                                            <span>Submitted</span>
                                            <span className="text-[#1A1A1A]">
                                                {new Date(
                                                    document.submitted_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Collaborator Modal - Non-functional UI Demo */}
            {showAddCollaboratorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-4">
                    <div className="relative w-full max-w-md border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 p-4">
                            <div>
                                <h3 className="font-playfair text-xl text-[#1A1A1A]">
                                    Add Co-author / Groupmate
                                </h3>
                                <p className="mt-1 font-sans text-sm text-[#6C6863]">
                                    Add a collaborator to this manuscript
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setShowAddCollaboratorModal(false)
                                }
                                className="text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCollaborator} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="collab-name"
                                        className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                    >
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="collab-name"
                                        type="text"
                                        value={collaboratorName}
                                        onChange={(e) =>
                                            setCollaboratorName(e.target.value)
                                        }
                                        placeholder="Enter groupmate's full name"
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="collab-email"
                                        className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                    >
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="collab-email"
                                        type="email"
                                        value={collaboratorEmail}
                                        onChange={(e) =>
                                            setCollaboratorEmail(e.target.value)
                                        }
                                        placeholder="groupmate@email.com"
                                        className="w-full"
                                        required
                                    />
                                </div>

                                {/* <div>
                                    <Label
                                        htmlFor="collab-role"
                                        className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                    >
                                        Role
                                    </Label>
                                    <select
                                        id="collab-role"
                                        value={collaboratorRole}
                                        onChange={(e) =>
                                            setCollaboratorRole(e.target.value)
                                        }
                                        className="w-full border border-[#1A1A1A]/20 bg-transparent p-2 font-sans text-sm focus:border-[#D4AF37] focus:outline-none"
                                    >
                                        {roles.map((role) => (
                                            <option
                                                key={role.value}
                                                value={role.value}
                                            >
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#1A1A1A] hover:bg-[#D4AF37]"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Collaborator
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setShowAddCollaboratorModal(false)
                                    }
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default MyManuscriptDetail;
