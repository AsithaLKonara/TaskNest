
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    link?: string
) => {
    try {
        await addDoc(collection(db, "notifications"), {
            userId,
            title,
            message,
            type,
            link,
            read: false,
            createdAt: Date.now() // Use client timestamp for simpler ordering or serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
