// resources/js/Pages/Student/UploadManuscript.tsx

import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Plus,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layout/app-layout';

const UploadManuscript: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        description: '',
        keywords: [] as string[],
        is_public: true,
    });

    const [keywordInput, setKeywordInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (
            selectedFile &&
            (selectedFile.type === 'application/pdf' ||
                selectedFile.type === 'application/msword' ||
                selectedFile.type ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        ) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: '' }));
        } else {
            setErrors((prev) => ({
                ...prev,
                file: 'Please upload a PDF or DOC/DOCX file',
            }));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                ['.docx'],
        },
        maxFiles: 1,
        multiple: false,
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setErrors({ file: 'Please select a file to upload' });
            return;
        }

        if (!formData.title.trim()) {
            setErrors({ title: 'Please enter a title' });
            return;
        }

        setUploading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('abstract', formData.abstract);
        data.append('description', formData.description);
        data.append('keywords', JSON.stringify(formData.keywords));
        data.append('is_public', formData.is_public ? '1' : '0');
        data.append('file', file);

        router.post('/student/documents', data, {
            onSuccess: () => {
                setUploading(false);
            },
            onError: (error) => {
                setErrors(error);
                setUploading(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Upload Manuscript - ASC KnowledgeVault" />

            <div className="mb-10">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Submit Your Work
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Upload Manuscript
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        Share your capstone research with the academic
                        community. All submissions are reviewed by faculty.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* File Dropzone */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Manuscript File *
                        </Label>
                        <div
                            {...getRootProps()}
                            className={`mt-2 cursor-pointer border-2 border-dashed p-8 text-center transition-all duration-500 ${
                                isDragActive
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                                    : 'border-[#1A1A1A]/20 hover:border-[#D4AF37]'
                            }`}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="h-8 w-8 text-[#D4AF37]" />
                                    <div>
                                        <p className="font-sans text-sm text-[#1A1A1A]">
                                            {file.name}
                                        </p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{' '}
                                            MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="ml-4 text-[#6C6863] hover:text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto h-10 w-10 text-[#6C6863]" />
                                    <p className="mt-2 font-sans text-sm text-[#6C6863]">
                                        {isDragActive
                                            ? 'Drop your manuscript here'
                                            : 'Drag & drop or click to browse'}
                                    </p>
                                    <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                        PDF, DOC, DOCX (Max 20MB)
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.file && (
                            <p className="mt-2 text-xs text-red-600">
                                {errors.file}
                            </p>
                        )}
                    </div>

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
                            rows={5}
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
                                            className="text-[#6C6863] hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Visibility
                        </Label>
                        <div className="flex gap-6">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    checked={formData.is_public}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            is_public: true,
                                        })
                                    }
                                    className="h-4 w-4 border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <span className="font-sans text-sm text-[#1A1A1A]">
                                    Public
                                </span>
                                <span className="font-sans text-xs text-[#6C6863]">
                                    (Visible to all users)
                                </span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    checked={!formData.is_public}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            is_public: false,
                                        })
                                    }
                                    className="h-4 w-4 border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <span className="font-sans text-sm text-[#1A1A1A]">
                                    Private
                                </span>
                                <span className="font-sans text-xs text-[#6C6863]">
                                    (Only you and reviewers)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="group relative h-12 bg-[#1A1A1A] px-8 hover:bg-[#D4AF37]"
                        >
                            {uploading ? (
                                'Uploading...'
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Manuscript
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/student/dashboard')}
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
                            Submission Guidelines
                        </span>
                    </div>
                    <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">
                        Before you upload
                    </h3>
                    <ul className="space-y-2 font-sans text-sm text-[#6C6863]">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
                            Ensure your manuscript follows the ASC capstone
                            format
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
                            Remove any personal information for blind review
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
                            Include all figures and tables within the document
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
                            Maximum file size is 20MB
                        </li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default UploadManuscript;
