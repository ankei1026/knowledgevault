// resources/js/Pages/Auth/Login.tsx

import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Use Inertia's post method instead of fetch
        router.post('/login', formData, {
            onSuccess: () => {
                // Success is handled by Inertia redirect
                setLoading(false);
            },
            onError: (error) => {
                setErrors(error);
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title="Login - ASC KnowledgeVault" />

            <div className="relative flex min-h-screen items-center justify-center bg-[#F9F8F6] px-6 py-12 lg:px-16">
                {/* Noise Overlay */}
                <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
                    <div className="noise-overlay" />
                </div>

                {/* Visible Grid Lines */}
                <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
                    <div className="relative mx-auto h-full max-w-[1600px] px-16">
                        <div className="absolute top-0 left-0 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute top-0 left-1/3 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute top-0 left-2/3 h-full w-px bg-[#1A1A1A]/20" />
                        <div className="absolute top-0 right-0 h-full w-px bg-[#1A1A1A]/20" />
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="h-px w-12 bg-[#D4AF37]" />
                        </div>
                        <h1 className="font-playfair mb-2 text-4xl text-[#1A1A1A]">
                            Welcome Back
                        </h1>
                        <p className="font-sans text-sm text-[#6C6863]">
                            Access your academic archive
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
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
                                    placeholder="your.email@asc.edu.ph"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <div className="mt-1 font-sans text-xs text-red-600">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
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
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-0 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-[#6C6863]" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-[#6C6863]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="group flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            remember: e.target.checked,
                                        })
                                    }
                                    className="h-3 w-3 border border-[#1A1A1A]/20 bg-transparent checked:border-[#D4AF37] checked:bg-[#D4AF37] focus:ring-0 focus:ring-offset-0"
                                />
                                <span className="font-sans text-xs text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="font-sans text-xs text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative h-12 w-full overflow-hidden bg-[#1A1A1A] transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center justify-center gap-2 font-sans text-xs font-medium tracking-[0.2em] text-white uppercase">
                                {loading ? 'Authenticating...' : 'Access Vault'}
                                {!loading && <LogIn className="h-3 w-3" />}
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
                                New to KnowledgeVault?
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link
                        href="/register"
                        className="group flex h-12 w-full items-center justify-center gap-2 border border-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A]"
                    >
                        <span className="font-sans text-xs tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 group-hover:text-white">
                            Create Account
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

export default Login;
