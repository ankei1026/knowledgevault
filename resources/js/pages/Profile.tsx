// resources/js/Pages/Profile/Index.tsx

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    User,
    Mail,
    Calendar,
    BookOpen,
    Bookmark,
    Award,
    Key,
    CheckCircle,
    Shield,
    LogOut,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    email_verified_at: string | null;
}

interface Stats {
    documents: number;
    saved_documents: number;
    final_submissions: number;
}

interface ProfileProps {
    user: UserData;
    stats: Stats;
}

const Profile: React.FC<ProfileProps> = ({ user, stats }) => {
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'faculty':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'student':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Shield className="h-4 w-4" />;
            case 'faculty':
                return <User className="h-4 w-4" />;
            case 'student':
                return <BookOpen className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'faculty':
                return 'Faculty Member';
            case 'student':
                return 'Student';
            default:
                return role;
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        router.post(
            '/profile/update-password',
            {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
            },
            {
                onSuccess: () => {
                    toast.success('Password updated successfully!');
                    setChangePasswordOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setNewPasswordConfirmation('');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to update password');
                    setIsSubmitting(false);
                },
            },
        );
    };

    const statCards = [
        {
            label: 'Documents',
            value: stats.documents,
            icon: BookOpen,
            color: '#D4AF37',
        },
        {
            label: 'Saved Documents',
            value: stats.saved_documents,
            icon: Bookmark,
            color: '#1A1A1A',
        },
        {
            label: 'Final Submissions',
            value: stats.final_submissions,
            icon: Award,
            color: '#10B981',
        },
    ];

    return (
        <AppLayout>
            <Head title="Profile - ASC KnowledgeVault" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            My Profile
                        </span>
                    </div>
                    <h1 className="font-playfair text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        Profile
                    </h1>
                    <p className="mt-2 font-sans text-base text-[#6C6863]">
                        View your profile information and manage your account.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="border border-[#1A1A1A]/10 bg-white p-8">
                    <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-[#D4AF37] bg-[#F9F8F6]">
                            <span className="font-playfair text-3xl text-[#D4AF37]">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="font-playfair text-2xl text-[#1A1A1A]">
                                    {user.name}
                                </h2>
                                <span
                                    className={`flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${getRoleBadge(user.role)}`}
                                >
                                    {getRoleIcon(user.role)}
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-[#6C6863]">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                    {user.email_verified_at && (
                                        <span className="flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {user.created_at}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => setChangePasswordOpen(true)}
                                className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                            >
                                <Key className="mr-2 h-4 w-4" />
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="border-[#1A1A1A]/20"
                        >
                            Go Back
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.post('/logout')}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Change Password Dialog */}
            <AlertDialog
                open={changePasswordOpen}
                onOpenChange={setChangePasswordOpen}
            >
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <Key className="h-6 w-6 text-[#D4AF37]" />
                            <AlertDialogTitle className="font-playfair text-2xl">
                                Change Password
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="mt-2 text-[#6C6863]">
                            Enter your current password and choose a new one.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <form onSubmit={handleChangePassword}>
                        <div className="my-4 space-y-4">
                            {/* Current Password */}
                            <div>
                                <Label
                                    htmlFor="current_password"
                                    className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                >
                                    Current Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        placeholder="Enter your current password"
                                        className="w-full pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                !showCurrentPassword,
                                            )
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6C6863] hover:text-[#1A1A1A]"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.current_password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <Label
                                    htmlFor="new_password"
                                    className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                >
                                    New Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new_password"
                                        type={
                                            showNewPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter your new password (min 8 characters)"
                                        className="w-full pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6C6863] hover:text-[#1A1A1A]"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.new_password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.new_password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <Label
                                    htmlFor="new_password_confirmation"
                                    className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                                >
                                    Confirm New Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new_password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={newPasswordConfirmation}
                                        onChange={(e) =>
                                            setNewPasswordConfirmation(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm your new password"
                                        className="w-full pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6C6863] hover:text-[#1A1A1A]"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="rounded bg-[#F9F8F6] p-3">
                                <p className="text-xs font-medium text-[#6C6863]">
                                    Password Requirements:
                                </p>
                                <ul className="mt-1 space-y-1 text-xs text-[#6C6863]">
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${newPassword.length >= 8 ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one uppercase letter
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one lowercase letter
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CheckCircle
                                            className={`h-3 w-3 ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-[#6C6863]/30'}`}
                                        />
                                        At least one number
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel
                                className="border-[#1A1A1A]/20 hover:bg-[#F9F8F6]"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setNewPasswordConfirmation('');
                                    setErrors({});
                                }}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#1A1A1A] hover:bg-[#D4AF37]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default Profile;
