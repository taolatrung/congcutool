import { LucideIcon } from 'lucide-react';

export type Language = 'vi' | 'en';

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
    name: string; // Default/Fallback name
    description: string; // Default/Fallback description
    translationKey: string; // Key for i18n
    icon: LucideIcon;
    category: ToolCategory;
    path: string;
    isNew?: boolean;
    isPopular?: boolean;
    comingSoon?: boolean;
    isPremium?: boolean; // Requires watching Ad
}

export interface ProcessingState {
    status: 'idle' | 'processing' | 'success' | 'error';
    message?: string;
    progress?: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: string;
    balance: number;
    vipExpiry?: string;
}

export interface VipPlan {
    id: string;
    name: string;
    durationDays: number;
    price: number;
    description: string;
    isPopular?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}