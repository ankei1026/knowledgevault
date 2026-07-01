// resources/js/Pages/Admin/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    Shield,
    Award,
    CheckCircle,
    XCircle,
    UserCheck,
    UserX,
    RefreshCw,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Key,
    Eye,
    EyeOff,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface UserManagementProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        students: number;
        faculty: number;
        admin: number;
    };
    filters: {
        search: string;
        role: string;
        status: string;
    };
}

const AdminUserManagement: React.FC<UserManagementProps> = ({
    users,
    stats,
    filters: initialFilters,
}) => {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedRole, setSelectedRole] = useState(
        initialFilters.role || 'all',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        initialFilters.status || 'all',
    );
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // Form state for creating user
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'student',
        password: '',
        password_confirmation: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset password form state
    const [resetPasswordData, setResetPasswordData] = useState({
        password: '',
        password_confirmation: '',
    });
    const [resetPasswordErrors, setResetPasswordErrors] = useState<
        Record<string, string>
    >({});
    const [resetPasswordSubmitting, setResetPasswordSubmitting] =
        useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.custom((t) => (
                <div className="flex items-center gap-3 rounded border border-yellow-200 bg-yellow-50 p-4 shadow-lg">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="font-sans text-sm text-yellow-800">
                        {flash.warning}
                    </p>
                </div>
            ));
        }
        if (flash?.info) {
            toast.custom((t) => (
                <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 shadow-lg">
                    <span className="text-blue-600">ℹ️</span>
                    <p className="font-sans text-sm text-blue-800">
                        {flash.info}
                    </p>
                </div>
            ));
        }
    }, [flash]);

    // Apply filters
    const applyFilters = () => {
        router.get(
            '/admin/users',
            {
                search: searchTerm,
                role: selectedRole,
                status: selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Filters applied successfully');
                },
            },
        );
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get(
            '/admin/users',
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Filters reset');
                },
            },
        );
    };

    // Handle create user
    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        router.post('/admin/users', formData, {
            onSuccess: () => {
                toast.success(`${formData.name} has been added successfully`);
                setShowCreateModal(false);
                setFormData({
                    name: '',
                    email: '',
                    role: 'student',
                    password: '',
                    password_confirmation: '',
                });
                setSubmitting(false);
            },
            onError: (errors) => {
                if (errors.email) {
                    toast.error('A user with this email already exists');
                } else if (errors.password) {
                    toast.error('Password must be at least 8 characters');
                } else {
                    toast.error('Please check the form for errors');
                }
                setFormErrors(errors);
                setSubmitting(false);
            },
        });
    };

    // Handle reset password
    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setResetPasswordSubmitting(true);
        setResetPasswordErrors({});

        if (!selectedUser) return;

        router.post(
            `/admin/users/${selectedUser.id}/reset-password`,
            resetPasswordData,
            {
                onSuccess: () => {
                    toast.success(
                        `Password for ${selectedUser.name} has been reset successfully`,
                    );
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                    setResetPasswordData({
                        password: '',
                        password_confirmation: '',
                    });
                    setResetPasswordSubmitting(false);
                },
                onError: (errors) => {
                    if (errors.password) {
                        toast.error('Password must be at least 8 characters');
                    } else {
                        toast.error('Please check the form for errors');
                    }
                    setResetPasswordErrors(errors);
                    setResetPasswordSubmitting(false);
                },
            },
        );
    };

    // Handle delete user
    const handleDeleteUser = (user: User) => {
        setDeleteUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deleteUser) return;

        router.delete(`/admin/users/${deleteUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${deleteUser.name} has been deleted`);
                setShowDeleteDialog(false);
                setDeleteUser(null);
            },
            onError: () => {
                toast.error('Unable to delete user');
            },
        });
    };

    // Open reset password modal
    const openResetPassword = (user: User) => {
        setSelectedUser(user);
        setResetPasswordData({
            password: '',
            password_confirmation: '',
        });
        setResetPasswordErrors({});
        setShowResetPasswordModal(true);
    };

    const roleColors = {
        admin: 'bg-[#1A1A1A] text-white',
        faculty: 'bg-[#D4AF37] text-white',
        student: 'bg-[#6C6863] text-white',
    };

    const roleIcons = {
        admin: Shield,
        faculty: Award,
        student: Users,
    };

    return (
        <AppLayout>
            <Head title="User Management - ASC KnowledgeVault" />

            {/* Page Header */}
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-px w-8 bg-[#D4AF37]" />
                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                        User Management
                    </span>
                </div>
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                            System Users
                        </h1>
                        <p className="font-sans text-base text-[#6C6863]">
                            Manage user accounts and permissions across the
                            KnowledgeVault platform.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="border-t-2 border-t-[#1A1A1A] pt-3">
                    <p className="font-sans text-xs text-[#6C6863]">
                        Total Users
                    </p>
                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                        {stats.total}
                    </p>
                </div>
                <div className="border-t-2 border-t-[#6C6863] pt-3">
                    <p className="font-sans text-xs text-[#6C6863]">Students</p>
                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                        {stats.students}
                    </p>
                </div>
                <div className="border-t-2 border-t-[#D4AF37] pt-3">
                    <p className="font-sans text-xs text-[#6C6863]">Faculty</p>
                    <p className="font-playfair text-2xl text-[#D4AF37]">
                        {stats.faculty}
                    </p>
                </div>
                <div className="border-t-2 border-t-[#1A1A1A] pt-3">
                    <p className="font-sans text-xs text-[#6C6863]">Admins</p>
                    <p className="font-playfair text-2xl text-[#1A1A1A]">
                        {stats.admin}
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search by name or email..."
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
                    <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                    />
                </Button>

                <Button onClick={applyFilters}>Apply</Button>

                <Button variant="ghost" onClick={resetFilters}>
                    Reset
                </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="mb-6 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F8F6] p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="mb-2 block">Role</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="student">
                                        Student
                                    </SelectItem>
                                    <SelectItem value="faculty">
                                        Faculty
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        Administrator
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto border border-[#1A1A1A]/10">
                <table className="w-full">
                    <thead className="border-b border-[#1A1A1A]/10 bg-[#F9F8F6]">
                        <tr>
                            <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                User
                            </th>
                            <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                Joined
                            </th>
                            <th className="px-4 py-3 text-center font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => {
                            const RoleIcon = roleIcons[user.role];
                            const isActive = !!user.email_verified_at;
                            return (
                                <tr
                                    key={user.id}
                                    className="border-b border-[#1A1A1A]/10 transition-colors duration-300 hover:bg-[#F9F8F6]/50"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center border border-[#1A1A1A]/20">
                                                <span className="font-playfair text-xs text-[#1A1A1A]">
                                                    {user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-sans text-sm text-[#1A1A1A]">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-sans text-sm text-[#6C6863]">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${roleColors[user.role]}`}
                                        >
                                            <RoleIcon className="h-3 w-3" />
                                            {user.role.charAt(0).toUpperCase() +
                                                user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-sans text-sm text-[#6C6863]">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <span className="sr-only">
                                                        Open menu
                                                    </span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openResetPassword(user)
                                                    }
                                                >
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteUser(user)
                                                    }
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {users.data.length === 0 && (
                    <div className="py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                        <p className="mt-3 font-sans text-[#6C6863]">
                            No users found
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="font-sans text-sm text-[#6C6863]">
                        Showing {users.data.length} of {users.total} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.get('/admin/users', {
                                    page: users.current_page - 1,
                                    search: searchTerm,
                                    role: selectedRole,
                                    status: selectedStatus,
                                })
                            }
                            disabled={users.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex h-8 items-center justify-center px-3 font-sans text-sm text-[#1A1A1A]">
                            Page {users.current_page} of {users.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.get('/admin/users', {
                                    page: users.current_page + 1,
                                    search: searchTerm,
                                    role: selectedRole,
                                    status: selectedStatus,
                                })
                            }
                            disabled={users.current_page === users.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Create User Dialog */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account for the KnowledgeVault
                            platform.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateUser}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="w-full">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            role: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="w-full">
                                        <SelectItem value="student">
                                            Student
                                        </SelectItem>
                                        <SelectItem value="faculty">
                                            Faculty
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Administrator
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    minLength={8}
                                />
                                {formErrors.password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">
                                    Confirm Password *
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog
                open={showResetPasswordModal}
                onOpenChange={setShowResetPasswordModal}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <span>
                                    Reset password for{' '}
                                    <strong>{selectedUser.name}</strong> (
                                    {selectedUser.email})
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleResetPassword}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="reset-password">
                                    New Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="reset-password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={resetPasswordData.password}
                                        onChange={(e) =>
                                            setResetPasswordData({
                                                ...resetPasswordData,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                        minLength={8}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6C6863] hover:text-[#1A1A1A]"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {resetPasswordErrors.password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {resetPasswordErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="reset-password-confirmation">
                                    Confirm New Password *
                                </Label>
                                <Input
                                    id="reset-password-confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    value={
                                        resetPasswordData.password_confirmation
                                    }
                                    onChange={(e) =>
                                        setResetPasswordData({
                                            ...resetPasswordData,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="rounded bg-[#F9F8F6] p-3">
                                <p className="text-xs font-medium text-[#6C6863]">
                                    Password Requirements:
                                </p>
                                <ul className="mt-1 space-y-1 text-xs text-[#6C6863]">
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${resetPasswordData.password.length >= 8 ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[A-Z]/.test(resetPasswordData.password) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one uppercase letter
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[a-z]/.test(resetPasswordData.password) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one lowercase letter
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[0-9]/.test(resetPasswordData.password) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one number
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowResetPasswordModal(false);
                                    setSelectedUser(null);
                                    setResetPasswordData({
                                        password: '',
                                        password_confirmation: '',
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={resetPasswordSubmitting}
                            >
                                {resetPasswordSubmitting
                                    ? 'Resetting...'
                                    : 'Reset Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteUser?.name}</strong>? This action
                            cannot be undone and will permanently remove the
                            user's account and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default AdminUserManagement;
