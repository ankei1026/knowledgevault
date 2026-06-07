// resources/js/Pages/Student/UploadManuscript.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    Plus,
    Trash2,
    Mail,
    Users,
    Eye,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layout/app-layout';

// Ensure component only renders on client side
const UploadManuscript: React.FC = () => {
    const [isClient, setIsClient] = useState(false);
    const { flash } = usePage().props as any;
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
    
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null);
    const [uploadedDocumentTitle, setUploadedDocumentTitle] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('co-author');
    const [inviteMessage, setInviteMessage] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);

    // Set isClient to true when component mounts (client-side only)
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (
            selectedFile &&
            (selectedFile.type === 'application/pdf' ||
                selectedFile.type === 'application/msword' ||
                selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        ) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: '' }));
        } else {
            toast.error('Please upload a PDF or DOC/DOCX file');
            setErrors((prev) => ({
                ...prev,
                file: 'Please upload a PDF or DOC/DOCX file',
            }));
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        onDrop(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        onDrop(files);
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
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

        if (!file) {
            toast.error('Please select a file to upload');
            setErrors({ file: 'Please select a file to upload' });
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
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
            onSuccess: (page: any) => {
                setUploading(false);
                toast.success('Manuscript uploaded successfully!');
                
                if (page.props.flash?.document) {
                    setUploadedDocumentId(page.props.flash.document.id);
                    setUploadedDocumentTitle(formData.title);
                    setShowInviteModal(true);
                } else {
                    setTimeout(() => {
                        router.get('/student/dashboard');
                    }, 1500);
                }
            },
            onError: (errors) => {
                setUploading(false);
                if (errors.file) {
                    toast.error('File upload failed. Please try again.');
                } else {
                    toast.error('Failed to upload manuscript. Please check your form.');
                }
                setErrors(errors);
            },
        });
    };

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedDocumentId) return;
        
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        
        setSendingInvite(true);

        router.post(`/student/documents/${uploadedDocumentId}/invite`, {
            email: inviteEmail,
            role: inviteRole,
            message: inviteMessage,
        }, {
            onSuccess: () => {
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInviteEmail('');
                setInviteMessage('');
                setSendingInvite(false);
                setShowInviteModal(false);
                router.get('/student/dashboard');
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to send invitation');
                setSendingInvite(false);
            },
        });
    };

    const handleSkipInvite = () => {
        setShowInviteModal(false);
        toast.success('You can invite collaborators later from your document page');
        router.get('/student/dashboard');
    };

    // Show loading on server side
    if (!isClient) {
        return (
            <AppLayout>
                <Head title="Upload Manuscript - ASC KnowledgeVault" />
                <div className="mx-auto max-w-4xl">
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
                        <p className="font-sans text-base text-[#6C6863]">Loading upload form...</p>
                    </div>
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                            <p className="font-sans text-sm text-[#6C6863]">Loading...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Upload Manuscript - ASC KnowledgeVault" />

            <div className="mb-8">
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
                        Share your capstone research with the academic community. All submissions are reviewed by faculty.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* File Dropzone */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Manuscript File *
                        </Label>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`mt-2 cursor-pointer border-2 border-dashed p-8 text-center transition-all duration-500 hover:border-[#D4AF37] border-[#1A1A1A]/20`}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="h-8 w-8 text-[#D4AF37]" />
                                    <div>
                                        <p className="font-sans text-sm text-[#1A1A1A]">{file.name}</p>
                                        <p className="font-sans text-xs text-[#6C6863]">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
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
                                        Drag & drop or click to browse
                                    </p>
                                    <p className="mt-1 font-sans text-xs text-[#6C6863]">
                                        PDF, DOC, DOCX (Max 20MB)
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="mt-2 text-xs text-red-600">{errors.file}</p>}
                    </div>

                    {/* Title */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label htmlFor="title" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Title *
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter your manuscript title"
                            className="w-full"
                        />
                        {errors.title && <p className="mt-2 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    {/* Abstract */}
                    <div className="border border-[#1A1A1A]/10 p-6">
                        <Label htmlFor="abstract" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Abstract
                        </Label>
                        <Textarea
                            id="abstract"
                            value={formData.abstract}
                            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
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
                        <Label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                placeholder="Add keywords (e.g., AI, Education, Research)"
                                className="flex-1"
                            />
                            <Button type="button" onClick={addKeyword} variant="outline" size="sm">
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
                                            onClick={() => removeKeyword(keyword)}
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
                                    onChange={() => setFormData({ ...formData, is_public: true })}
                                    className="h-4 w-4 border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <span className="font-sans text-sm text-[#1A1A1A]">Public</span>
                                <span className="font-sans text-xs text-[#6C6863]">(Visible to all users)</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    checked={!formData.is_public}
                                    onChange={() => setFormData({ ...formData, is_public: false })}
                                    className="h-4 w-4 border-[#1A1A1A]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <span className="font-sans text-sm text-[#1A1A1A]">Private</span>
                                <span className="font-sans text-xs text-[#6C6863]">(Only you and reviewers)</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={uploading} className="group relative h-12 bg-[#1A1A1A] px-8 hover:bg-[#D4AF37]">
                            {uploading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Manuscript
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get('/student/dashboard')}>
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
                    <h3 className="font-playfair mb-3 text-lg text-[#1A1A1A]">Before you upload</h3>
                    <ul className="space-y-2 font-sans text-sm text-[#6C6863]">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
                            Ensure your manuscript follows the ASC capstone format
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

            {/* Invite Collaborators Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-4">
                    <div className="relative w-full max-w-2xl border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 p-4">
                            <div>
                                <h3 className="font-playfair text-xl text-[#1A1A1A]">Invite Collaborators</h3>
                                <p className="mt-1 font-sans text-sm text-[#6C6863]">{uploadedDocumentTitle}</p>
                            </div>
                            <button onClick={handleSkipInvite} className="text-[#6C6863] transition-colors hover:text-[#D4AF37]">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSendInvite} className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                        <Input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@example.com"
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Role *</Label>
                                    <Select value={inviteRole} onValueChange={setInviteRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="co-author">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>Co-author - Can edit and submit</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="reviewer">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    <span>Reviewer - Can review and comment</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Personal Message (Optional)</Label>
                                    <textarea
                                        value={inviteMessage}
                                        onChange={(e) => setInviteMessage(e.target.value)}
                                        placeholder="I'd like to invite you to collaborate on my research..."
                                        rows={3}
                                        className="w-full border border-[#1A1A1A]/20 bg-transparent p-2 font-sans text-sm transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={sendingInvite} className="flex-1 bg-[#1A1A1A] hover:bg-[#D4AF37]">
                                        <Send className="mr-2 h-4 w-4" />
                                        {sendingInvite ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleSkipInvite}>
                                        Skip
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default UploadManuscript;