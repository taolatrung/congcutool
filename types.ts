import { LucideIcon } from 'lucide-react';

export enum ToolCategory {
    IMAGE = 'Hình ảnh & AI',
    PDF = 'Tài liệu PDF',
    AI = 'AI Tools Hot',
    TEXT = 'Văn bản',
    VIDEO = 'Video & Âm thanh',
    UTILITY = 'Tiện ích & Năng suất',
    DEV = 'Developer Tools'
}

export interface ToolDef {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: ToolCategory;
    path: string;
    isNew?: boolean;
    isPopular?: boolean;
    comingSoon?: boolean;
    isPremium?: boolean; // Marks a tool as Paid/Ad-gated
    price?: number;      // Cost per use (default 1000 if not set)
}

export interface ProcessingState {
    status: 'idle' | 'processing' | 'success' | 'error';
    message?: string;
    progress?: number;
}

// --- NEW AUTH TYPES ---

export interface User {
    id: string;
    email: string;
    name: string;
    balance: number; // Stored in VND
    avatarUrl?: string;
    vipUntil?: string | null; // Date ISO string. If present and future, user is VIP
    createdAt: string;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'DEPOSIT' | 'SPEND' | 'VIP_PURCHASE';
    amount: number;
    description: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface VipPlan {
    id: string;
    name: string;
    durationDays: number;
    price: number;
    description: string;
    isPopular?: boolean;
}