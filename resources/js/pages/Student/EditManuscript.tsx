// resources/js/Pages/Student/EditManuscript.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    FileText,
    Save,
    X,
    Plus,
    Trash2,
    ChevronLeft,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Document {
    id: number;
    title: string;
    abstract: string | null;
    description: string | null;
    keywords: string[] | null;
    status: string;
    file_name: string | null;
    file_size: string | null;
    created_at: string;
    updated_at: string;
}

interface EditManuscriptProps {
    document: Document;
}

const EditManuscript: React.FC<EditManuscriptProps> = ({ document }) => {
    const [formData, setFormData] = useState({
        title: document.title || '',
        abstract: document.abstract || '',
        description: document.description || '',
        keywords: document.keywords || [],
    });
    const [keywordInput, setKeywordInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addKeyword = () => {
        if (
            keywordInput.trim() &&
            !formData.keywords.includes(keywordInput.trim())
        ) {
            setFormData((prev) => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()],
            }));
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setFormData((prev) => ({
            ...prev,
            keywords: prev.keywords.filter((k) => k !== keyword),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            setErrors({ title: 'Please enter a title' });
            return;
        }

        setSaving(true);
        setErrors({});

        router.put(`/student/my-manuscripts/${document.id}`, formData, {
            onSuccess: () => {
                toast.success('Manuscript updated successfully!');
                setSaving(false);
                router.visit(`/student/my-manuscripts/${document.id}`);
            },
            onError: (error) => {
                toast.error('Failed to update manuscript');
                setErrors(error);
                setSaving(false);
            },
        });
    };

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published':
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending_review':
                return <Clock className="h-4 w-4" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit: ${document.title} - ASC KnowledgeVault`} />

            <div className="mx-auto max-w-7xl">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href={`/student/my-manuscripts/${document.id}`}
                        className="inline-flex items-center gap-2 font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Manuscript
                    </Link>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    Edit Manuscript
                                </span>
                            </div>
                            <h1 className="font-playfair text-4xl leading-[1.2] text-[#1A1A1A] md:text-5xl">
                                {document.title}
                            </h1>
                        </div>
                        <span
                            className={`flex items-center gap-2 rounded border px-3 py-1 font-sans text-sm ${getStatusBadge(document.status)}`}
                        >
                            {getStatusIcon(document.status)}
                            {getStatusLabel(document.status)}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-[#6C6863]">
                        {document.file_name && (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-sans">
                                    {document.file_name}
                                </span>
                            </div>
                        )}
                        {document.file_size && (
                            <div className="flex items-center gap-2">
                                <span className="font-sans">
                                    Size: {document.file_size}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-sans">
                                Last updated:{' '}
                                {new Date(
                                    document.updated_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label
                            htmlFor="title"
                            className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                        >
                            Title *
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Enter your manuscript title"
                            className="w-full"
                        />
                        {errors.title && (
                            <p className="mt-2 text-xs text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Abstract */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label
                            htmlFor="abstract"
                            className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                        >
                            Abstract
                        </Label>
                        <Textarea
                            id="abstract"
                            value={formData.abstract}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    abstract: e.target.value,
                                })
                            }
                            placeholder="Summarize your research (150-250 words)"
                            rows={6}
                            className="w-full resize-none"
                        />
                        <p className="mt-2 text-right text-xs text-[#6C6863]">
                            {formData.abstract.length} characters
                        </p>
                    </div>

                    {/* Description */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Provide additional details about your research"
                            rows={4}
                            className="w-full resize-none"
                        />
                    </div>

                    {/* Keywords */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Keywords
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={keywordInput}
                                onChange={(e) =>
                                    setKeywordInput(e.target.value)
                                }
                                onKeyPress={(e) =>
                                    e.key === 'Enter' &&
                                    (e.preventDefault(), addKeyword())
                                }
                                placeholder="Add keywords (e.g., AI, Education, Research)"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                onClick={addKeyword}
                                variant="outline"
                                size="sm"
                                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                        {formData.keywords.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {formData.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="inline-flex items-center gap-1 rounded border border-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 text-xs text-[#1A1A1A]"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeKeyword(keyword)
                                            }
                                            className="text-[#6C6863] transition-colors hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Read-only File Info */}
                    {document.file_name && (
                        <div className="border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-[#D4AF37]" />
                                <div>
                                    <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                        {document.file_name}
                                    </p>
                                    <p className="font-sans text-xs text-[#6C6863]">
                                        Uploaded file cannot be changed. To
                                        update the file, please upload a new
                                        manuscript.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning for submitted manuscripts */}
                    {document.status === 'pending_review' && (
                        <div className="border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-sans text-sm font-medium text-yellow-800">
                                        Manuscript is under review
                                    </p>
                                    <p className="font-sans text-xs text-yellow-700">
                                        Changes to the manuscript while under
                                        review may affect the review process.
                                        Please contact the reviewer if you need
                                        to make significant changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="group relative h-12 bg-[#1A1A1A] px-8 hover:bg-[#D4AF37]"
                        >
                            {saving ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.visit(
                                    `/student/my-manuscripts/${document.id}`,
                                )
                            }
                            className="border-[#1A1A1A]"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>

                {/* Guidelines */}
                <div className="mt-12 border border-[#1A1A1A]/10 bg-[#F9F8F6] p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-px w-6 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Editing Guidelines
                        </span>
                    </div>
                    <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                        Before you save
                    </h3>
                    <ul className="space-y-2 font-sans text-sm text-[#6C6863]">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-[#D4AF37]">•</span>
                            Ensure your title is clear and descriptive
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-[#D4AF37]">•</span>
                            Abstract should be concise (150-250 words)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-[#D4AF37]">•</span>
                            Keywords help with discoverability
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-[#D4AF37]">•</span>
                            Changes are saved immediately
                        </li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default EditManuscript;
