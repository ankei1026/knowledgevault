// resources/js/Components/Header.tsx

import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
    className?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'faculty' | 'student';
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const { auth } = usePage().props as { auth: { user: User | null } };
    const user = auth?.user;

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'About', href: '#about' },
        { label: 'Team', href: '#team' },
        { label: 'Archive', href: '/guest/documents' },
    ];

    const getDashboardRoute = () => {
        if (!user) return '/login';

        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'faculty':
                return '/faculty/dashboard';
            case 'student':
                return '/student/dashboard';
            default:
                return '/login';
        }
    };

    const getDashboardLabel = () => {
        if (!user) return 'Access Vault';

        switch (user.role) {
            case 'admin':
                return 'Admin Dashboard';
            case 'faculty':
                return 'Faculty Dashboard';
            case 'student':
                return 'Student Dashboard';
            default:
                return 'Dashboard';
        }
    };

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 border-b border-[#1A1A1A]/10 bg-[#F9F8F6]/95 backdrop-blur-sm ${className}`}
        >
            <div className="mx-auto max-w-[1600px] px-6 py-5 lg:px-16">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group">
                        <div className="mb-1 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase transition-colors group-hover:text-[#D4AF37]">
                            Andres Soriano College of Bislig
                        </div>
                        <h2 className="font-playfair text-xl tracking-tight text-[#1A1A1A] transition-colors group-hover:text-[#D4AF37]">
                            KnowledgeVault
                        </h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-10 md:flex">
                        {user ? (
                            // Show dashboard link for authenticated users
                            <Link
                                href={getDashboardRoute()}
                                className="flex items-center gap-2 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        ) : (
                            // Show regular nav items for guests
                            navItems.map((item) =>
                                item.href.startsWith('#') ? (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                    >
                                        {item.label}
                                    </Link>
                                ),
                            )
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            // Authenticated user actions
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setUserMenuOpen(!userMenuOpen)
                                    }
                                    className="group relative flex h-11 items-center gap-3 overflow-hidden bg-[#1A1A1A] px-4 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                    <User className="relative z-10 h-4 w-4 text-white" />
                                    <span className="relative z-10 hidden font-sans text-sm text-white sm:inline">
                                        {user.name.split(' ')[0]}
                                    </span>
                                </button>

                                {/* User dropdown menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-sm border border-[#1A1A1A]/10 bg-white shadow-lg">
                                        <div className="border-b border-[#1A1A1A]/10 px-4 py-3">
                                            <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                                                {user.name}
                                            </p>
                                            <p className="font-sans text-xs text-[#6C6863]">
                                                {user.email}
                                            </p>
                                            <div className="mt-1">
                                                <span className="inline-block rounded-full bg-[#D4AF37]/10 px-2 py-0.5 font-sans text-[10px] font-medium tracking-wider text-[#D4AF37] uppercase">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href={getDashboardRoute()}
                                                className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-[#1A1A1A] transition-colors hover:bg-[#F9F8F6] hover:text-[#D4AF37]"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 px-4 py-2 font-sans text-sm text-[#1A1A1A] transition-colors hover:bg-[#F9F8F6] hover:text-red-600"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Guest actions
                            <>
                                <Link
                                    href="/login"
                                    className="group relative hidden h-11 items-center overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:flex"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                    <span className="relative z-10 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                        Access Vault
                                    </span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37] md:block"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-[#1A1A1A] md:hidden"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mt-6 space-y-4 border-t border-[#1A1A1A]/10 pt-6 md:hidden">
                        {user ? (
                            // Mobile menu for authenticated users
                            <>
                                <div className="border-b border-[#1A1A1A]/10 pb-4">
                                    <p className="font-sans font-medium text-[#1A1A1A]">
                                        {user.name}
                                    </p>
                                    <p className="font-sans text-sm text-[#6C6863]">
                                        {user.email}
                                    </p>
                                    <div className="mt-2">
                                        <span className="inline-block rounded-full bg-[#D4AF37]/10 px-2 py-0.5 font-sans text-[10px] font-medium tracking-wider text-[#D4AF37] uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={getDashboardRoute()}
                                    className="flex items-center gap-2 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-red-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Link>
                            </>
                        ) : (
                            // Mobile menu for guests
                            <>
                                {navItems.map((item) =>
                                    item.href.startsWith('#') ? (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            {item.label}
                                        </Link>
                                    ),
                                )}
                                <Link
                                    href="/login"
                                    className="group relative inline-block h-11 overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                    <span className="relative z-10 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                        Access Vault
                                    </span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;
