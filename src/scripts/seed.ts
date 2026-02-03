
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";

// Config from user
const firebaseConfig = {
    apiKey: "AIzaSyCmI6uPZztpru0zZb3U3DrZSAPxLb27Bi8",
    authDomain: "tasknest-1c332.firebaseapp.com",
    projectId: "tasknest-1c332",
    storageBucket: "tasknest-1c332.firebasestorage.app",
    messagingSenderId: "372856334321",
    appId: "1:372856334321:web:a2d9f414b9aa081bf9c650"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const seedData = async () => {
    console.log("🌱 Starting Database Seed...");

    // 1. Create Client
    try {
        console.log("Creating Client...");
        const clientEmail = "client@demo.com";
        const password = "password123";

        let clientUserCredential;
        try {
            clientUserCredential = await createUserWithEmailAndPassword(auth, clientEmail, password);
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                clientUserCredential = await signInWithEmailAndPassword(auth, clientEmail, password);
            } else throw e;
        }

        const clientUid = clientUserCredential.user.uid;
        await updateProfile(clientUserCredential.user, { displayName: "Sarah Miller" });

        await setDoc(doc(db, "users", clientUid), {
            uid: clientUid,
            email: clientEmail,
            displayName: "Sarah Miller",
            role: "client",
            createdAt: Date.now()
        });

        // 2. Create Job for Client
        console.log("Creating Job...");
        await setDoc(doc(db, "jobs", "job-demo-01"), {
            jobId: "job-demo-01",
            clientId: clientUid,
            title: "Modern E-commerce UI Design",
            description: "We are looking for a talented UI designer to create a modern, responsive e-commerce website design. The design should be clean, user-friendly, and mobile-first. Experience with Figma is required.",
            budget: 500,
            deadline: "2024-03-01",
            skills: ["Figma", "UI Design", "E-commerce"],
            status: "open",
            createdAt: Date.now()
        });

        await signOut(auth);

        // 3. Create Freelancer
        console.log("Creating Freelancer...");
        const freelancerEmail = "freelancer@demo.com";

        let freelancerUserCredential;
        try {
            freelancerUserCredential = await createUserWithEmailAndPassword(auth, freelancerEmail, password);
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                freelancerUserCredential = await signInWithEmailAndPassword(auth, freelancerEmail, password);
            } else throw e;
        }

        const freelancerUid = freelancerUserCredential.user.uid;
        await updateProfile(freelancerUserCredential.user, { displayName: "Alex Chen" });

        await setDoc(doc(db, "users", freelancerUid), {
            uid: freelancerUid,
            email: freelancerEmail,
            displayName: "Alex Chen",
            role: "freelancer",
            createdAt: Date.now()
        });

        await setDoc(doc(db, "freelancerProfiles", freelancerUid), {
            uid: freelancerUid,
            title: "Senior UI/UX Designer",
            bio: "I have 5+ years of experience designing beautiful and functional interfaces for web and mobile applications. My focus is on creating user-centric designs that drive engagement.",
            skills: ["Figma", "React", "Tailwind CSS", "UI/UX"],
            priceRange: "$40-$60/hr",
            rating: 4.8,
            reviewCount: 12,
            verified: true,
            availability: "part-time",
            portfolio: [],
            languages: ["English", "Mandarin"]
        });

        await signOut(auth);

        console.log("✅ Seeding Complete!");

        // 4. Create Admin (Super Admin)
        console.log("Creating Admin...");
        const adminEmail = "admin@demo.com";

        let adminUserCredential;
        try {
            adminUserCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                adminUserCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
            } else throw e;
        }

        const adminUid = adminUserCredential.user.uid;
        await updateProfile(adminUserCredential.user, { displayName: "Super Admin" });

        await setDoc(doc(db, "users", adminUid), {
            uid: adminUid,
            email: adminEmail,
            displayName: "Super Admin",
            role: "admin",
            createdAt: Date.now()
        });

        console.log("Client: client@demo.com / password123");
        console.log("Freelancer: freelancer@demo.com / password123");
        console.log("Admin: admin@demo.com / password123");
        console.log("Freelancer: freelancer@demo.com / password123");

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
    }
    process.exit(0);
};

seedData();
