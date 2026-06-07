// resources/js/Pages/layout/app-layout.tsx

import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Menu,
    Search,
    User,
    Bell,
    BookOpen,
    FileText,
    Users,
    Settings,
    LogOut,
    ChevronDown,
    Home,
    Library,
    Clock,
    Award,
    TrendingUp,
    Grid3x3,
    Download,
    Bookmark,
    Eye,
    ChevronRight,
    LayoutDashboard,
    GraduationCap,
    Briefcase,
    Shield,
} from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { url, props } = usePage();

    // Get user from either direct user prop or auth.user (common in Inertia)
    const user = (props as any)?.user || (props as any)?.auth?.user;
    const flash = (props as any)?.flash;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocus, setSearchFocus] = useState(false);
    const [toast, setToast] = useState<{
        type: string;
        message: string;
    } | null>(null);

    // Debug: Log user to see what's coming from the backend
    useEffect(() => {
        console.log('AppLayout - All props:', props);
        console.log('AppLayout - User:', user);
        console.log('AppLayout - User Role:', user?.role);
    }, [user, props]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            setTimeout(() => setToast(null), 5000);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            setTimeout(() => setToast(null), 5000);
        }
        if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
            setTimeout(() => setToast(null), 5000);
        }
        if (flash?.info) {
            setToast({ type: 'info', message: flash.info });
            setTimeout(() => setToast(null), 5000);
        }
    }, [flash]);

    // Get role-specific dashboard link
    const getDashboardLink = () => {
        const role = user?.role;
        console.log('Getting dashboard link for role:', role);

        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'faculty':
                return '/faculty/dashboard';
            case 'student':
                return '/student/dashboard';
            default:
                return '/dashboard';
        }
    };

    // Get role-specific dashboard icon
    const getDashboardIcon = () => {
        switch (user?.role) {
            case 'admin':
                return Shield;
            case 'faculty':
                return Briefcase;
            case 'student':
                return GraduationCap;
            default:
                return LayoutDashboard;
        }
    };

    // Navigation items based on role
    const navigationItems = [];

    // Only show navigation if user is logged in
    if (user) {
        // Dashboard section (role-specific)
        const DashboardIcon = getDashboardIcon();
        navigationItems.push({
            section: 'Overview',
            items: [
                {
                    name: 'Dashboard',
                    href: getDashboardLink(),
                    icon: DashboardIcon,
                },
            ],
        });

        // Main section (common for all roles)
        navigationItems.push({
            section: 'Digital Library',
            items: [
                { name: 'Browse Archive', href: '/documents', icon: FileText },
                { name: 'Recent Activity', href: '/recent', icon: Clock },
                { name: 'Saved Papers', href: '/saved', icon: Bookmark },
                { name: 'Trending', href: '/trending', icon: TrendingUp },
            ],
        });

        // Role-specific sections
        if (user?.role === 'student') {
            navigationItems.push({
                section: 'My Work',
                items: [
                    {
                        name: 'Upload Manuscript',
                        href: '/student/documents/upload',
                        icon: Download,
                    },
                    {
                        name: 'My Library',
                        href: '/student/library',
                        icon: Library,
                    },
                ],
            });
        }

        if (user?.role === 'faculty') {
            navigationItems.push({
                section: 'Review & Mentorship',
                items: [
                    {
                        name: 'Pending Reviews',
                        href: '/faculty/submissions',
                        icon: Eye,
                    },
                    {
                        name: 'My Students',
                        href: '/faculty/students',
                        icon: Users,
                    },
                    {
                        name: 'Review History',
                        href: '/faculty/reviews',
                        icon: Clock,
                    },
                ],
            });
        }

        if (user?.role === 'admin') {
            navigationItems.push({
                section: 'Administration',
                items: [
                    {
                        name: 'User Management',
                        href: '/admin/users',
                        icon: Users,
                    },
                    {
                        name: 'All Documents',
                        href: '/admin/documents',
                        icon: Grid3x3,
                    },
                    {
                        name: 'System Settings',
                        href: '/admin/settings',
                        icon: Settings,
                    },
                    {
                        name: 'Analytics',
                        href: '/admin/analytics',
                        icon: TrendingUp,
                    },
                ],
            });
        }
    }

    const handleLogout = async () => {
        router.post(
            '/logout',
            {},
            {
                onSuccess: () => {
                    setToast({
                        type: 'success',
                        message: 'You have been successfully logged out.',
                    });
                    setTimeout(() => setToast(null), 5000);
                },
                onError: () => {
                    setToast({
                        type: 'error',
                        message: 'Unable to logout. Please try again.',
                    });
                    setTimeout(() => setToast(null), 5000);
                },
            },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/documents/search', { q: searchQuery });
        } else {
            setToast({
                type: 'warning',
                message: 'Please enter a search term.',
            });
            setTimeout(() => setToast(null), 5000);
        }
    };

    const getToastStyles = () => {
        if (!toast) return '';
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-500 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-500 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-500 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-500 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-500 text-gray-800';
        }
    };

    // Get role display name
    const getRoleDisplayName = () => {
        switch (user?.role) {
            case 'admin':
                return 'Administrator';
            case 'faculty':
                return 'Faculty Member';
            case 'student':
                return 'Student Researcher';
            default:
                return 'Guest';
        }
    };

    // Always render the layout structure, but show loading or nothing if no user
    // Don't return early - always render the layout wrapper

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Toast Notification */}
            {toast && (
                <div className="animate-slide-in fixed top-20 right-4 z-50">
                    <div
                        className={`border-l-4 p-4 shadow-lg ${getToastStyles()}`}
                    >
                        <p className="font-sans text-sm">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Noise Overlay */}
            <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.02]">
                <div className="noise-overlay" />
            </div>

            {/* Top Navigation Bar - Only show if user exists */}
            {user && (
                <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#1A1A1A]/10 bg-[#F9F8F6]/98 backdrop-blur-sm">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo Section */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="-ml-2 p-2 text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37] lg:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>

                                <Link
                                    href={getDashboardLink()}
                                    className="group"
                                >
                                    <div className="mb-0.5 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                        ASC KnowledgeVault
                                    </div>
                                    <div className="font-playfair text-xl text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                        Digital Library
                                    </div>
                                </Link>
                            </div>

                            {/* Search Bar */}
                            <form
                                onSubmit={handleSearch}
                                className="mx-8 hidden max-w-md flex-1 md:block"
                            >
                                <div
                                    className={`relative w-full transition-all duration-500 ${searchFocus ? 'scale-[1.02]' : ''}`}
                                >
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        onFocus={() => setSearchFocus(true)}
                                        onBlur={() => setSearchFocus(false)}
                                        placeholder="Search by title, author, or keywords..."
                                        className="h-10 w-full border-b border-[#1A1A1A]/20 bg-transparent pr-4 pl-10 font-sans text-sm transition-colors duration-500 placeholder:text-[#6C6863] placeholder:italic focus:border-[#D4AF37] focus:outline-none"
                                    />
                                    <Search className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                                </div>
                            </form>

                            {/* User Actions */}
                            <div className="flex items-center gap-4">
                                <button
                                    className="relative p-2 text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                    onClick={() => {
                                        setToast({
                                            type: 'info',
                                            message:
                                                'You have 3 unread notifications.',
                                        });
                                        setTimeout(() => setToast(null), 5000);
                                    }}
                                >
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                                </button>

                                <div className="group relative">
                                    <button className="flex items-center gap-3 p-1">
                                        <div className="flex h-8 w-8 items-center justify-center border border-[#1A1A1A]/20 transition-all duration-500 group-hover:border-[#D4AF37]">
                                            <span className="font-playfair text-xs text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                                {user?.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="hidden text-left lg:block">
                                            <div className="font-sans text-sm text-[#1A1A1A]">
                                                {user?.name}
                                            </div>
                                            <div className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase">
                                                {getRoleDisplayName()}
                                            </div>
                                        </div>
                                        <ChevronDown className="hidden h-4 w-4 text-[#6C6863] transition-colors duration-500 group-hover:text-[#D4AF37] lg:block" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="invisible absolute right-0 z-50 mt-2 w-56 border border-[#1A1A1A]/10 bg-[#F9F8F6] opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:visible group-hover:opacity-100">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 border-b border-[#1A1A1A]/5 px-4 py-3 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:bg-[#1A1A1A]/5"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-3 border-b border-[#1A1A1A]/5 px-4 py-3 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:bg-[#1A1A1A]/5"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-3 font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:bg-[#1A1A1A]/5"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Search Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="border-t border-[#1A1A1A]/10 py-3 md:hidden"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search digital library..."
                                    className="h-10 w-full border border-[#1A1A1A]/20 bg-transparent pr-4 pl-10 font-sans text-sm transition-colors duration-500 placeholder:text-[#6C6863] placeholder:italic focus:border-[#D4AF37] focus:outline-none"
                                />
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                            </div>
                        </form>
                    </div>
                </nav>
            )}

            {/* Sidebar Navigation - Only show if user exists */}
            {user && (
                <aside
                    className={`fixed top-16 bottom-0 left-0 z-40 w-64 transform overflow-y-auto border-r border-[#1A1A1A]/10 bg-[#F9F8F6] transition-transform duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                >
                    <div className="px-6 py-8">
                        {navigationItems.map((section, idx) => (
                            <div key={idx} className="mb-8">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-px w-4 bg-[#D4AF37]" />
                                    <h3 className="font-sans text-[10px] font-medium tracking-[0.25em] text-[#6C6863] uppercase">
                                        {section.section}
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive =
                                            url === item.href ||
                                            url.startsWith(item.href + '/');
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`group flex items-center justify-between px-3 py-2.5 transition-all duration-500 ${
                                                    isActive
                                                        ? 'border-l-2 border-[#D4AF37] bg-[#1A1A1A]/5'
                                                        : 'hover:bg-[#1A1A1A]/5'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon
                                                        className={`h-4 w-4 transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-[#6C6863] group-hover:text-[#D4AF37]'}`}
                                                    />
                                                    <span
                                                        className={`font-sans text-sm transition-colors duration-500 ${isActive ? 'font-medium text-[#1A1A1A]' : 'text-[#6C6863] group-hover:text-[#1A1A1A]'}`}
                                                    >
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    className={`h-3 w-3 transition-all duration-500 ${isActive ? 'text-[#D4AF37] opacity-100' : 'text-[#6C6863] opacity-0 group-hover:opacity-100'}`}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Role Badge */}
                        <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6">
                            <div className="border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                                    <span className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase">
                                        {getRoleDisplayName()}
                                    </span>
                                </div>
                                <p className="font-sans text-xs text-[#6C6863]">
                                    Logged in as{' '}
                                    <span className="font-medium text-[#1A1A1A]">
                                        {user?.name}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-[#1A1A1A]/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area - Always render, adjust padding based on user */}
            <main
                className={`pt-16 transition-all duration-500 ${user ? 'lg:pl-64' : ''}`}
            >
                <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-16">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer
                className={`mt-8 border-t border-[#1A1A1A]/10 py-8 transition-all duration-500 ${user ? 'lg:pl-64' : ''}`}
            >
                <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-center md:text-left">
                            <div className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                Andres Soriano College of Bislig
                            </div>
                            <div className="mt-1 font-sans text-xs text-[#6C6863]">
                                KnowledgeVault Digital Library
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <a
                                href="#"
                                className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                About
                            </a>
                            <a
                                href="#"
                                className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Help
                            </a>
                            <a
                                href="#"
                                className="font-sans text-[10px] tracking-[0.2em] text-[#6C6863] uppercase transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Contact
                            </a>
                        </div>
                        <div className="font-sans text-[10px] text-[#6C6863]">
                            © 2025 ASC KnowledgeVault
                        </div>
                    </div>
                </div>
            </footer>

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
                }

                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                ::-webkit-scrollbar {
                    width: 4px;
                }

                ::-webkit-scrollbar-track {
                    background: #EBE5DE;
                }

                ::-webkit-scrollbar-thumb {
                    background: #D4AF37;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #1A1A1A;
                }
            `}</style>
        </div>
    );
};

export default AppLayout;
