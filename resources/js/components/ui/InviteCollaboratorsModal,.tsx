// resources/js/Components/InviteCollaboratorsModal.tsx

import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { X, Mail, Send, Users, Eye } from 'lucide-react';
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

interface InviteCollaboratorsModalProps {
    documentId: number;
    documentTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onInviteSent?: () => void;
}

const InviteCollaboratorsModal: React.FC<InviteCollaboratorsModalProps> = ({
    documentId,
    documentTitle,
    isOpen,
    onClose,
    onInviteSent,
}) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('co-author');
    const [inviteMessage, setInviteMessage] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        
        setSendingInvite(true);

        router.post(`/student/documents/${documentId}/invite`, {
            email: inviteEmail,
            role: inviteRole,
            message: inviteMessage,
        }, {
            onSuccess: () => {
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInviteEmail('');
                setInviteMessage('');
                setSendingInvite(false);
                onInviteSent?.();
                onClose();
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to send invitation');
                setSendingInvite(false);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-4">
            <div className="relative w-full max-w-2xl border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 p-4">
                    <div>
                        <h3 className="font-playfair text-xl text-[#1A1A1A]">Invite Collaborators</h3>
                        <p className="mt-1 font-sans text-sm text-[#6C6863]">{documentTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-[#6C6863] transition-colors hover:text-[#D4AF37]">
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
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteCollaboratorsModal;