"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserRole, User as UserProfile } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    role: UserRole | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as UserProfile;
                        setProfile({ ...userData, uid: currentUser.uid });
                        setRole(userData.role);
                    } else {
                        console.error("User document not found for:", currentUser.uid);
                        setProfile(null);
                        setRole(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setRole(null);
                    setProfile(null);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setProfile(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setRole(null);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, role, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
