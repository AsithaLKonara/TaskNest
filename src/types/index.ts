export type UserRole = 'freelancer' | 'client' | 'admin';

export interface User {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    role: UserRole;
    createdAt: number; // Timestamp
    stripeCustomerId?: string; // Legacy/Optional
    payhereCustomerId?: string; // Added for PayHere
    wallet?: Wallet; // Add internal wallet
    kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
    verified?: boolean;
    clientMetrics?: {
        trustScore: number;
        totalSpent: number;
        cancelledByClient: number;
        disputeCount: number;
    }
}

export interface Wallet {
    availableBalance: number;
    lockedBalance: number; // Escrow funds
    currency: string;
    lastUpdated: number;
}

export interface Transaction {
    transactionId: string;
    userId: string;
    orderId?: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'refund';
    status: 'pending' | 'completed' | 'failed';
    gateway?: 'payhere' | 'manual' | 'stripe';
    reference?: string; // Gateway ref
    createdAt: number;
}

export interface FreelancerProfile {
    uid: string;
    name?: string;
    title: string;
    bio: string;
    skills: string[];
    languages: string[];
    priceRange: string; // e.g. "$10-$30/hr"
    verified: boolean;
    status: 'pending' | 'approved' | 'suspended';
    kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
    kycDocuments?: {
        type: 'nic' | 'passport' | 'driving_license';
        url: string;
        submittedAt: number;
    }[];
    visibility: 'normal' | 'limited' | 'hidden';
    lastActiveAt?: number;
    lastOrderCompletedAt?: number;
    available?: boolean;
    portfolio: string[]; // URLs
    nicUrl?: string;
    photoURL?: string;
    stripeAccountId?: string; // Legacy
    payhereMerchantId?: string; // Optional
    payoutDetails?: {
        method: 'bank_transfer' | 'payoneer' | 'manual';
        accountNumber?: string; // Hashed/masked in UI
        bankName?: string;
        accountName?: string;
    };
    onboardingComplete?: boolean;
    availability: 'full-time' | 'part-time';
    rating: number;
    reviewCount: number;
    metrics?: {
        completionRate: number;
        responseTimeAvg: number;
        totalOrders: number;
        disputeCount: number;
        successScore?: number;
        proposalAcceptanceRate?: number;
        proposalsSentCount?: number;
    };
}

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'expired';

export interface Job {
    jobId: string;
    clientId: string;
    clientName?: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: number;
    skills?: string[];
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

export type OrderStatus = 'awaiting_payment' | 'active' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed' | 'on_hold';

export interface Order {
    orderId: string;
    jobId: string;
    clientId: string;
    freelancerId: string;
    price: number;
    status: OrderStatus;
    escrowStatus: 'none' | 'held' | 'released' | 'refunded'; // Added for internal escrow
    paymentProofUrl?: string;
    payherePaymentId?: string; // Added for PayHere
    deliverables?: {
        version: number;
        url: string;
        comment?: string;
        submittedAt: number;
        status: 'pending' | 'approved' | 'revision_requested';
    }[];
    currentRevision: number;
    maxRevisions: number;
    chatId?: string; // Link to messaging
    createdAt: number;
    firstResponseAt?: number;
    cancelledBy?: 'client' | 'freelancer' | 'admin';
    disputeReason?: string;
    mediationResult?: string;
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

export interface Notification {
    id: string;
    userId: string; // Recipient
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: number;
}
