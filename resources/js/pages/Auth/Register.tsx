// resources/js/Pages/Auth/Register.tsx

import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    Briefcase,
} from 'lucide-react';

const Register: React.FC = () => {
    const { errors: pageErrors } = usePage().props as any;
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const roles = [
        { value: 'student', label: 'Student Researcher' },
        { value: 'faculty', label: 'Faculty Member' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/register', formData, {
            onSuccess: (page) => {
                setLoading(false);
                // The redirect will happen automatically
            },
            onError: (error) => {
                console.log('Registration errors:', error);
                setErrors(error);
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title="Register - ASC KnowledgeVault" />

            <div className="relative flex min-h-screen items-center justify-center bg-[#F9F8F6] px-6 py-12 lg:px-16">
                {/* Noise Overlay */}
                <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
                    <div className="noise-overlay" />
                </div>

                {/* Visible Grid Lines */}
                <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
                    <div className="relative mx-auto h-full max-w-[1600px] px-16">
                        <div className="absolute left-0 top-0 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute left-1/3 top-0 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute left-2/3 top-0 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute right-0 top-0 h-full w-px bg-[#1A1A1A]/20" />
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="h-px w-12 bg-[#D4AF37]" />
                        </div>
                        <h1 className="mb-2 font-playfair text-4xl text-[#1A1A1A]">
                            Join the Archive
                        </h1>
                        <p className="font-sans text-sm text-[#6C6863]">
                            Create your KnowledgeVault account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block font-sans text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-[#1A1A1A]/20 bg-transparent py-2 pl-6 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                    placeholder="Juan Dela Cruz"
                                    required
                                />
                            </div>
                            {(errors.name || pageErrors?.name) && (
                                <p className="mt-1 font-sans text-xs text-red-600">
                                    {errors.name || pageErrors?.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-[#1A1A1A]/20 bg-transparent py-2 pl-6 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                    placeholder="juan.delacruz@asc.edu.ph"
                                    required
                                />
                            </div>
                            {(errors.email || pageErrors?.email) && (
                                <p className="mt-1 font-sans text-xs text-red-600">
                                    {errors.email || pageErrors?.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">
                                Role
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                <select
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.value,
                                        })
                                    }
                                    className="w-full appearance-none border-b border-[#1A1A1A]/20 bg-transparent py-2 pl-6 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                >
                                    {roles.map((role) => (
                                        <option
                                            key={role.value}
                                            value={role.value}
                                            className="bg-[#F9F8F6]"
                                        >
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-[#1A1A1A]/20 bg-transparent py-2 pr-8 pl-6 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                    placeholder="Minimum 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-0 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-[#6C6863]" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-[#6C6863]" />
                                    )}
                                </button>
                            </div>
                            {(errors.password || pageErrors?.password) && (
                                <p className="mt-1 font-sans text-xs text-red-600">
                                    {errors.password || pageErrors?.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                <input
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-[#1A1A1A]/20 bg-transparent py-2 pr-8 pl-6 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 focus:border-[#D4AF37] focus:outline-none"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-0 top-1/2 -translate-y-1/2"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-[#6C6863]" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-[#6C6863]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative mt-6 h-12 w-full overflow-hidden bg-[#1A1A1A] transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center justify-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white">
                                {loading
                                    ? 'Creating Account...'
                                    : 'Create Account'}
                                {!loading && <UserPlus className="h-3 w-3" />}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#1A1A1A]/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#F9F8F6] px-4 font-sans text-[#6C6863]">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        href="/login"
                        className="group flex h-12 w-full items-center justify-center gap-2 border border-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A]"
                    >
                        <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#1A1A1A] transition-colors duration-500 group-hover:text-white">
                            Sign In
                        </span>
                        <ArrowRight className="h-3 w-3 text-[#1A1A1A] transition-colors duration-500 group-hover:text-white" />
                    </Link>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                .noise-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    background-repeat: repeat;
                    opacity: 0.02;
                }
            `}</style>
        </>
    );
};

export default Register;