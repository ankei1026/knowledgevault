// resources/js/Pages/Faculty/Students.tsx

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Users,
    User,
    Mail,
    BookOpen,
    Search,
    ChevronDown,
    ChevronRight,
    Users as UsersIcon,
    UserPlus,
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Input } from '@/components/ui/input';

interface CoAuthor {
    name: string;
    email: string;
}

interface Manuscript {
    id: number;
    title: string;
    status: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    program: string;
    year_level: string;
    co_authors: CoAuthor[];
    manuscripts: Manuscript[];
}

interface FacultyStudentsProps {
    students: Student[];
    stats: {
        total_students: number;
        total_manuscripts: number;
    };
}

const FacultyStudents: React.FC<FacultyStudentsProps> = ({
    students,
    stats,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.program.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AppLayout>
            <Head title="My Students - ASC KnowledgeVault" />

            <div className="mx-auto max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="font-sans text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
                            Mentorship
                        </span>
                    </div>
                    <h1 className="font-playfair mb-2 text-4xl leading-[1.1] text-[#1A1A1A] md:text-5xl">
                        My Students
                    </h1>
                    <p className="font-sans text-base text-[#6C6863]">
                        View your students and their groupmates with manuscript
                        titles.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#D4AF37]" />
                            <span className="font-sans text-sm text-[#1A1A1A]">
                                {stats.total_students} Students
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                            <span className="font-sans text-sm text-[#1A1A1A]">
                                {stats.total_manuscripts} Manuscripts
                            </span>
                        </div>
                    </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6C6863]" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search students..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Students Grid - Like Google Classroom */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-[#6C6863]/30" />
                            <p className="mt-3 font-sans text-[#6C6863]">
                                No students found
                            </p>
                        </div>
                    ) : (
                        filteredStudents.map((student) => (
                            <div
                                key={student.id}
                                className="border border-[#1A1A1A]/10 bg-white transition-all duration-300 hover:shadow-md"
                            >
                                {/* Student Card Header */}
                                <div
                                    className="cursor-pointer p-4 transition-colors hover:bg-[#F9F8F6]/50"
                                    onClick={() =>
                                        setExpandedStudent(
                                            expandedStudent === student.id
                                                ? null
                                                : student.id,
                                        )
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#D4AF37]">
                                                <span className="font-playfair text-lg text-[#D4AF37]">
                                                    {student.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-playfair text-base text-[#1A1A1A]">
                                                    {student.name}
                                                </h3>

                                                <div className="mt-1 flex items-center gap-1 text-xs text-[#6C6863]">
                                                    <Mail className="h-3 w-3" />
                                                    {student.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[#6C6863]">
                                                {student.manuscripts.length}{' '}
                                                titles
                                            </span>
                                            {expandedStudent === student.id ? (
                                                <ChevronDown className="h-4 w-4 text-[#6C6863]" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-[#6C6863]" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedStudent === student.id && (
                                    <div className="border-t border-[#1A1A1A]/10 bg-[#F9F8F6] p-4">
                                        {/* Co-authors / Groupmates */}
                                        <div className="mb-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <UsersIcon className="h-4 w-4 text-[#D4AF37]" />
                                                <span className="font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                    Groupmates
                                                </span>
                                            </div>
                                            {student.co_authors.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {student.co_authors.map(
                                                        (author, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="flex items-center gap-1 rounded border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-2 py-1 text-xs text-[#1A1A1A]"
                                                            >
                                                                <User className="h-3 w-3 text-[#D4AF37]" />
                                                                {author.name}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#6C6863]">
                                                    No groupmates
                                                </p>
                                            )}
                                        </div>

                                        {/* Manuscript Titles */}
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                                                <span className="font-sans text-xs font-medium tracking-[0.2em] text-[#6C6863] uppercase">
                                                    Titles
                                                </span>
                                            </div>
                                            {student.manuscripts.length > 0 ? (
                                                <div className="space-y-1">
                                                    {student.manuscripts.map(
                                                        (manuscript) => (
                                                            <div
                                                                key={
                                                                    manuscript.id
                                                                }
                                                                className="flex items-center gap-2 rounded border border-[#1A1A1A]/10 bg-white px-3 py-1.5 text-sm"
                                                            >
                                                                <span className="text-[#1A1A1A]">
                                                                    {
                                                                        manuscript.title
                                                                    }
                                                                </span>
                                                                <span className="ml-auto text-xs text-[#6C6863]">
                                                                    {
                                                                        manuscript.status
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#6C6863]">
                                                    No manuscripts
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Stats */}
                <div className="mt-6 flex justify-between text-sm text-[#6C6863]">
                    <span>
                        Showing {filteredStudents.length} of {students.length}{' '}
                        students
                    </span>
                </div>
            </div>
        </AppLayout>
    );
};

export default FacultyStudents;
