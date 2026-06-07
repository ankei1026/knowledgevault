// resources/js/Components/NotificationBell.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X, Eye } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        document_id?: number;
        document_title?: string;
        assigned_by_name?: string;
        message: string;
        action_url?: string;
        action_text?: string;
    };
    read_at: string | null;
    created_at: string;
}

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/notifications?unread=true');
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchAllNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications');
            const data = await response.json();
            setNotifications(data.notifications?.data || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/notifications/${id}/read`, { method: 'POST' });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/notifications/mark-all-read', { method: 'POST' });
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    if (!isOpen) {
                        fetchAllNotifications();
                    }
                    setIsOpen(!isOpen);
                }}
                className="relative p-2 text-[#6C6863] transition-colors duration-500 hover:text-[#D4AF37]"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 border border-[#1A1A1A]/10 bg-[#F9F8F6] shadow-lg lg:w-96">
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 p-3">
                        <h3 className="font-playfair text-sm text-[#1A1A1A]">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                                <p className="text-xs text-[#6C6863]">
                                    Loading...
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto h-8 w-8 text-[#6C6863]/30" />
                                <p className="mt-2 text-sm text-[#6C6863]">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`cursor-pointer border-b border-[#1A1A1A]/10 p-3 transition-colors hover:bg-[#1A1A1A]/5 ${
                                        !notification.read_at
                                            ? 'bg-[#D4AF37]/5'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-[#1A1A1A]">
                                                {notification.data.message}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[#6C6863]">
                                                {formatDistanceToNow(
                                                    new Date(
                                                        notification.created_at,
                                                    ),
                                                    { addSuffix: true },
                                                )}
                                            </p>
                                        </div>
                                        {!notification.read_at && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="text-[#6C6863] transition-colors hover:text-[#D4AF37]"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-[#1A1A1A]/10 p-2 text-center">
                        <Link
                            href="/notifications"
                            className="block text-xs text-[#D4AF37] transition-colors hover:text-[#1A1A1A]"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
