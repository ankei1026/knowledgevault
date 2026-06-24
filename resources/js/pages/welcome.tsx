// resources/js/Pages/Welcome.tsx

import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Search,
    Shield,
    Clock,
    ArrowRight,
    ChevronDown,
    FileText,
    Users,
    Database,
    Award,
    Menu,
    X,
    User,
    Github,
    Linkedin,
    Mail,
} from 'lucide-react';

// Custom CSS for luxury/editorial styles that complement shadcn
const luxuryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  .font-playfair {
    font-family: 'Playfair Display', serif;
  }

  .writing-mode-vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .noise-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    opacity: 0.02;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .group-hover\\:grayscale-0,
    .group-hover\\:scale-105,
    .transition-all,
    .duration-500,
    .duration-700,
    .duration-\\[1500ms\\] {
      transition-duration: 0.01ms !important;
    }
  }
`;

interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
    stat?: string;
}

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
}

const Welcome: React.FC = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Inject custom styles
        const styleElement = document.createElement('style');
        styleElement.textContent = luxuryStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const features: Feature[] = [
        {
            icon: FileText,
            title: 'Document Repository',
            description:
                'Centralized archive for capstone manuscripts and research papers with version control.',
            stat: '+2,500 Docs',
        },
        {
            icon: Search,
            title: 'Smart Search',
            description:
                'Advanced filtering and full-text search across all archived academic documents.',
            stat: '< 0.5s',
        },
        {
            icon: Shield,
            title: 'Role-Based Access',
            description:
                'Secure access control for students, faculty, and administrators.',
            stat: '3 Roles',
        },
    ];

    const stats = [
        { value: '0+', label: 'Documents Archived', icon: Database },
        { value: '0+', label: 'Active Researchers', icon: Users },
        { value: '0+', label: 'Capstone Projects', icon: Award },
        { value: '98%', label: 'System Uptime', icon: Clock },
    ];

    const faqs = [
        {
            q: 'What types of documents can I upload?',
            a: 'The system supports PDF, DOCX, and TXT formats for capstone manuscripts, research papers, theses, and supporting documentation.',
        },
        {
            q: 'How is document security handled?',
            a: 'All documents are encrypted at rest and in transit. Access is strictly controlled through role-based permissions and audit logging.',
        },
        {
            q: 'Can I collaborate with other researchers?',
            a: 'Yes, the system includes collaborative features allowing multiple researchers to access shared documents with proper permissions.',
        },
        {
            q: 'Is there a backup system?',
            a: 'Documents are automatically backed up daily to redundant storage with version history for the past 12 months.',
        },
    ];

    const teamMembers: TeamMember[] = [
        {
            id: 1,
            name: 'Czarha O. Limpuasan',
            role: 'Member',
            image: '/images/Czarha.jpg',
        },
        {
            id: 2,
            name: 'Nathaniel G. Vito Jr.',
            role: 'Member',
            image: '/images/Nathaniel.jpg',
        },
        {
            id: 3,
            name: 'Radz C. Dela Peña',
            role: 'Member',
            image: '/images/Radz.jpg',
        },
        {
            id: 4,
            name: 'Elson Morales',
            role: 'Member',
            image: '/images/Elson.jpg',
        },
        {
            id: 5,
            name: 'Franklie B. Tahuyan',
            role: 'Member',
            image: '/images/Franklie.jpg',
        },
    ];

    return (
        <>
            <Head title="ASC KnowledgeVault - Document Management System" />

            {/* Noise Overlay */}
            <div className="noise-overlay" />

            {/* Navigation */}
            <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#1A1A1A]/10 bg-[#F9F8F6]/95 backdrop-blur-sm">
                <div className="mx-auto max-w-[1600px] px-6 py-5 lg:px-16">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-1 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                Andres Soriano College of Bislig
                            </div>
                            <h2 className="font-playfair text-xl tracking-tight text-[#1A1A1A]">
                                KnowledgeVault
                            </h2>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center gap-10 md:flex">
                            <a
                                href="#features"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Features
                            </a>
                            <a
                                href="#about"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                About
                            </a>
                            <a
                                href="#team"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Team
                            </a>
                            <a
                                href="#stats"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Impact
                            </a>
                            <a
                                href="#faq"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                FAQ
                            </a>
                            <Link
                                href="/guest/documents"
                                className="font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                            >
                                Archive
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="group relative hidden h-11 items-center overflow-hidden bg-[#1A1A1A] px-6 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:flex"
                            >
                                <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                <span className="relative z-10 font-sans text-[11px] font-medium tracking-[0.2em] text-white uppercase">
                                    Access Vault
                                </span>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="p-2 text-[#1A1A1A] md:hidden"
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
                            <a
                                href="#features"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#about"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </a>
                            <a
                                href="#team"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Team
                            </a>
                            <a
                                href="#stats"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Impact
                            </a>
                            <a
                                href="#faq"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </a>
                            <a
                                href="/documents"
                                className="block font-sans text-sm text-[#1A1A1A] transition-colors duration-500 hover:text-[#D4AF37]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Archive
                            </a>
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
                        </div>
                    )}
                </div>
            </nav>

            <main className="z-20 pt-20">
                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center border-b border-[#1A1A1A]/10">
                    <div className="mx-auto w-full max-w-[1600px] px-6 py-16 lg:px-16 lg:py-32">
                        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-5 lg:col-start-2">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="h-px w-10 bg-[#1A1A1A]/20" />
                                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                        Academic Archiving Reimagined
                                    </span>
                                </div>

                                <h1 className="font-playfair mb-6 text-5xl leading-[0.9] tracking-tight text-[#1A1A1A] md:text-7xl lg:text-8xl xl:text-9xl">
                                    ASC
                                    <br />
                                    <span className="text-[#D4AF37] italic">
                                        Knowledge
                                    </span>
                                    <br />
                                    Vault
                                </h1>

                                <p className="mb-10 max-w-md font-sans text-base leading-relaxed text-[#6C6863] md:text-lg">
                                    A sophisticated archiving system for
                                    preserving and managing capstone manuscripts
                                    and research papers at Andres Soriano
                                    College of Bislig.
                                </p>

                                <div className="flex flex-col gap-5 sm:flex-row">
                                    <Link
                                        href="/register"
                                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden bg-[#1A1A1A] px-8 transition-shadow duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                                    >
                                        <span className="absolute inset-0 -translate-x-full bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0" />
                                        <span className="relative z-10 font-sans text-xs font-medium tracking-[0.2em] text-white uppercase">
                                            Get Started
                                        </span>
                                    </Link>
                                    <a
                                        href="#features"
                                        className="group flex h-12 items-center justify-center gap-2 border border-[#1A1A1A] px-6 transition-all duration-500 hover:bg-[#1A1A1A]"
                                    >
                                        <span className="font-sans text-xs tracking-[0.2em] text-[#1A1A1A] uppercase transition-colors duration-500 group-hover:text-white">
                                            Learn More
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-[#1A1A1A] transition-colors duration-500 group-hover:text-white" />
                                    </a>
                                </div>
                            </div>

                            <div className="mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0">
                                <div className="group relative">
                                    <div className="relative overflow-hidden bg-white shadow-[0_12px_48px_rgba(0,0,0,0.15)]">
                                        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#EBE5DE] to-[#D4AF37]/20">
                                            <img
                                                src="/images/Documents.jpeg"
                                                alt="Document Management Interface"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    <div className="font-sans text-[11px] tracking-[0.25em] text-[#6C6863] uppercase">
                                        Document Management Interface
                                    </div>
                                    <div className="mt-3 h-px w-full bg-[#1A1A1A]/10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce md:block">
                        <ChevronDown className="h-5 w-5 text-[#6C6863]" />
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="border-b border-[#1A1A1A]/10 py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-10 lg:col-start-2">
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="h-px w-8 bg-[#D4AF37]" />
                                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                        The Archive
                                    </span>
                                </div>
                                <h2 className="font-playfair text-4xl leading-[1.1] tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl xl:text-7xl">
                                    Intelligent Document
                                    <br />
                                    <span className="text-[#D4AF37] italic">
                                        Management
                                    </span>{' '}
                                    for Academia
                                </h2>
                                <div className="mt-6 h-px w-20 bg-[#1A1A1A]/20" />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group border-t border-[#1A1A1A]/20 pt-6 transition-all duration-700 hover:bg-[#F9F8F6]/50"
                                    >
                                        <Icon className="mb-5 h-9 w-9 text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]" />
                                        <h3 className="font-playfair mb-2 text-xl text-[#1A1A1A]">
                                            {feature.title}
                                        </h3>
                                        <p className="mb-3 font-sans text-sm leading-relaxed text-[#6C6863]">
                                            {feature.description}
                                        </p>
                                        <div className="font-sans text-[11px] tracking-[0.2em] text-[#D4AF37] uppercase">
                                            {feature.stat}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section
                    id="team"
                    className="border-b border-[#1A1A1A]/10 py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="mb-16 text-center">
                            <div className="mb-5 flex justify-center gap-4">
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                    The Makers
                                </span>
                                <div className="h-px w-8 bg-[#D4AF37]" />
                            </div>
                            <h2 className="font-playfair text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl lg:text-6xl">
                                Meet the{' '}
                                <span className="text-[#D4AF37] italic">
                                    Capstone Team
                                </span>
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl font-sans text-base text-[#6C6863]">
                                The brilliant minds behind ASC KnowledgeVault,
                                dedicated to revolutionizing academic archiving.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="group border border-[#1A1A1A]/10 p-6 text-center transition-all duration-500 hover:border-[#D4AF37] hover:shadow-md"
                                >
                                    <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden border border-[#1A1A1A]/10 transition-all duration-500 group-hover:border-[#D4AF37] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[#EBE5DE]">
                                                <User className="h-12 w-12 text-[#6C6863]" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-playfair text-lg text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#D4AF37]">
                                        {member.name}
                                    </h3>
                                    <p className="mt-1 font-sans text-sm text-[#6C6863]">
                                        {member.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section - Dark */}
                <section
                    id="stats"
                    className="border-b border-[#1A1A1A]/20 bg-[#1A1A1A] py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-4 lg:col-start-2">
                                <div className="absolute left-16 hidden xl:block">
                                    <div className="writing-mode-vertical font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                        Measurable Impact
                                    </div>
                                </div>
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="h-px w-10 bg-[#D4AF37]" />
                                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                        By The Numbers
                                    </span>
                                </div>
                                <h2 className="font-playfair text-4xl leading-[1.1] text-[#F9F8F6] md:text-5xl lg:text-6xl">
                                    Transforming Academic
                                    <br />
                                    <span className="text-[#D4AF37] italic">
                                        Archiving
                                    </span>
                                </h2>
                                <p className="mt-5 font-sans text-base leading-relaxed text-[#EBE5DE]/80">
                                    Since our launch, ASC KnowledgeVault has
                                    become the central repository for academic
                                    research at Andres Soriano College of
                                    Bislig.
                                </p>
                            </div>

                            <div className="lg:col-span-5 lg:col-start-7">
                                <div className="grid grid-cols-2 gap-6 lg:gap-10">
                                    {stats.map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div
                                                key={index}
                                                className="border-t border-[#D4AF37]/30 pt-5"
                                            >
                                                <Icon className="mb-3 h-7 w-7 text-[#D4AF37]" />
                                                <div className="font-playfair mb-1 text-3xl text-[#F9F8F6] lg:text-4xl">
                                                    {stat.value}
                                                </div>
                                                <div className="font-sans text-[11px] tracking-[0.2em] text-[#EBE5DE]/60 uppercase">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section
                    id="about"
                    className="border-b border-[#1A1A1A]/10 py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-4 lg:col-start-2">
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="h-px w-8 bg-[#D4AF37]" />
                                    <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                                        The System
                                    </span>
                                </div>
                                <h2 className="font-playfair text-4xl leading-[1.1] tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl">
                                    Purpose-built for
                                    <br />
                                    <span className="text-[#D4AF37] italic">
                                        Capstone and Research
                                    </span>{' '}
                                    Management
                                </h2>
                                <div className="my-6 h-px w-16 bg-[#1A1A1A]/20" />

                                <p className="mb-5 font-sans text-base leading-relaxed text-[#6C6863]">
                                    The KnowledgeVault system addresses the
                                    critical need for organized, searchable, and
                                    secure storage of academic documents at ASC.
                                </p>

                                <p className="font-sans text-sm leading-relaxed text-[#6C6863]">
                                    Built with modern web technologies and
                                    designed with academic workflows in mind,
                                    the platform ensures that valuable research
                                    is preserved, accessible, and properly
                                    attributed.
                                </p>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 bg-[#D4AF37]" />
                                        <span className="font-sans text-sm text-[#1A1A1A]">
                                            Version Control
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 bg-[#D4AF37]" />
                                        <span className="font-sans text-sm text-[#1A1A1A]">
                                            Export / Download
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 lg:col-start-7">
                                <div className="space-y-6">
                                    <div className="group relative">
                                        <div className="overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                                            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#EBE5DE] to-[#D4AF37]/10">
                                                <BookOpen className="h-16 w-16 text-[#1A1A1A]/30" />
                                            </div>
                                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                                Upload & Catalog
                                            </span>
                                            <div className="h-px w-12 bg-[#1A1A1A]/10" />
                                        </div>
                                    </div>

                                    <div className="group relative">
                                        <div className="overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                                            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#EBE5DE] to-[#D4AF37]/10">
                                                <Search className="h-16 w-16 text-[#1A1A1A]/30" />
                                            </div>
                                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                                Smart Search
                                            </span>
                                            <div className="h-px w-12 bg-[#1A1A1A]/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#F9F8F6] py-12">
                    <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
                        <div className="grid gap-10 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="mb-1 font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                    Andres Soriano College of Bislig
                                </div>
                                <h3 className="font-playfair mb-3 text-xl text-[#1A1A1A]">
                                    KnowledgeVault
                                </h3>
                                <p className="max-w-md font-sans text-sm leading-relaxed text-[#6C6863]">
                                    Preserving academic excellence through
                                    sophisticated document management and
                                    archiving.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-3 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                    Resources
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            API Access
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Support
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-3 font-sans text-[11px] tracking-[0.2em] text-[#1A1A1A] uppercase">
                                    Legal
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Terms of Use
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="font-sans text-sm text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
                                        >
                                            Data Security
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-10 border-t border-[#1A1A1A]/10 pt-6 text-center">
                            <div className="font-sans text-[10px] tracking-[0.25em] text-[#6C6863] uppercase">
                                © 2025 ASC KnowledgeVault — Capstone Project
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
};

export default Welcome;
