export type UserRole = 'freelancer' | 'client' | 'admin';

export interface User {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    role: UserRole;
    createdAt: number; // Timestamp
}

export interface FreelancerProfile {
    uid: string;
    title: string;
    bio: string;
    skills: string[];
    languages: string[];
    priceRange: string; // e.g. "$10-$30/hr"
    verified: boolean;
    portfolio: string[]; // URLs
    nicUrl?: string;
    availability: 'full-time' | 'part-time';
    rating: number;
    reviewCount: number;
}

export type JobStatus = 'open' | 'in-progress' | 'completed';

export interface Job {
    jobId: string;
    clientId: string;
    clientName?: string; // Denormalized for easier display
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: number; // Timestamp or date string
    status: JobStatus;
    createdAt: number;
}

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Proposal {
    proposalId: string;
    jobId: string;
    freelancerId: string;
    freelancerName?: string;
    freelancerTitle?: string;
    message: string;
    quote: number;
    estimatedDays: number;
    status: ProposalStatus;
    createdAt: number;
}

export type OrderStatus = 'active' | 'completed' | 'cancelled';

export interface Order {
    orderId: string;
    jobId: string;
    clientId: string;
    freelancerId: string;
    price: number;
    status: OrderStatus;
    paymentProofUrl?: string; // For manual bank transfer verification
    createdAt: number;
}

export interface Message {
    messageId: string;
    chatId: string;
    senderId: string;
    text: string;
    fileUrl?: string;
    timestamp: number;
}

export interface Chat {
    chatId: string;
    participants: string[]; // [adminId, userId] or [freelancerId, clientId]
    participantData: {
        [userId: string]: {
            displayName: string;
            photoURL?: string;
        }
    };
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: number;
    };
    updatedAt: number;
}

export interface Review {
    reviewId: string;
    orderId: string;
    reviewerId: string; // Client
    targetId: string; // Freelancer
    rating: number; // 1-5
    comment: string;
    createdAt: number;
}
