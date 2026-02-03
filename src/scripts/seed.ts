
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Config (Preserved)
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

// --- MOCK DATA GENERATORS ---

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore"];
const SKILLS = ["React", "Node.js", "Python", "Design", "Figma", "UI/UX", "Writing", "SEO", "Marketing", "Java", "C++", "AWS", "Firebase", "SQL", "Mobile App", "Flutter", "Swift"];
const JOB_TITLES = ["Senior React Developer", "UI/UX Designer", "Full Stack Engineer", "Content Writer", "SEO Specialist", "Mobile App Developer", "Backend Architect", "Frontend Ninja", "Digital Marketer", "Logo Designer"];
const CATEGORIES = ["Web Development", "Mobile App", "UI/UX Design", "Content Writing", "Marketing", "Data Science"];
const JOB_DESCRIPTIONS = [
    "Looking for an expert to build a responsive website using React and Tailwind.",
    "Need a mobile app developer for a fitness tracking application (iOS/Android).",
    "We need a redesign of our corporate landing page to increase conversions.",
    "Seeking a technical writer to document our API endpoints.",
    "Need help optimizing our e-commerce site for SEO and speed.",
    "Building a SaaS platform and need a backend engineer with Node.js experience.",
    "Create a stunning 3D logo animation for our gaming startup."
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubarray = (arr: any[], n: number) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SEED FUNCTION ---

const seedData = async () => {
    console.log("🌱 Starting Bulk Database Seed...");

    const createdClients: string[] = []; // UIDs
    const createdFreelancers: string[] = []; // UIDs
    const password = "password123";

    // Helper to create user safely
    const createUser = async (email: string, name: string, role: 'client' | 'freelancer' | 'admin') => {
        try {
            console.log(`Creating ${role}: ${email}...`);
            let cred;
            try {
                cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });
            } catch (e: any) {
                if (e.code === 'auth/email-already-in-use') {
                    cred = await signInWithEmailAndPassword(auth, email, password);
                } else throw e;
            }

            const uid = cred.user.uid;

            // Create User Doc
            await setDoc(doc(db, "users", uid), {
                uid,
                email,
                displayName: name,
                role,
                createdAt: Date.now()
            });

            // If Freelancer, create Profile
            if (role === 'freelancer') {
                const skills = getRandomSubarray(SKILLS, 3 + Math.floor(Math.random() * 3));
                await setDoc(doc(db, "freelancerProfiles", uid), {
                    uid,
                    title: getRandom(JOB_TITLES),
                    bio: `I am a passionate ${tags(skills[0])} expert with over ${Math.floor(Math.random() * 8) + 2} years of experience. I deliver high-quality work on time.`,
                    skills,
                    priceRange: `$${20 + Math.floor(Math.random() * 50)}-$${80 + Math.floor(Math.random() * 50)}/hr`,
                    rating: (3.5 + Math.random() * 1.5).toFixed(1), // 3.5 to 5.0
                    reviewCount: Math.floor(Math.random() * 50),
                    verified: Math.random() > 0.3,
                    status: 'approved',
                    available: true,
                    availability: Math.random() > 0.5 ? "full-time" : "part-time",
                    portfolio: [],
                    languages: ["English"],
                    photoURL: ""
                });
            }

            await signOut(auth); // Sign out to be clean
            await delay(500); // Rate limit buffer
            return uid;
        } catch (e) {
            console.error(`Failed to create ${email}:`, e);
            return null;
        }
    };

    const tags = (s: string) => s; // Just a helper

    // 1. Create Fixed Users (Demo Accounts)
    const clientDemoUid = await createUser("client@demo.com", "Sarah Miller", "client");
    if (clientDemoUid) createdClients.push(clientDemoUid);

    const freelancerDemoUid = await createUser("freelancer@demo.com", "Alex Chen", "freelancer");
    if (freelancerDemoUid) createdFreelancers.push(freelancerDemoUid);

    const adminDemoUid = await createUser("admin@demo.com", "Super Admin", "admin");
    // Admin doesn't go into arrays for job/proposal matching usually

    // 2. Bulk Create Users (10 Clients, 10 Freelancers)
    for (let i = 1; i <= 10; i++) {
        const name = `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;
        const email = `client${i}@test.com`;
        const uid = await createUser(email, name, "client");
        if (uid) createdClients.push(uid);
    }

    for (let i = 1; i <= 10; i++) {
        const name = `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;
        const email = `freelancer${i}@test.com`;
        const uid = await createUser(email, name, "freelancer");
        if (uid) createdFreelancers.push(uid);
    }

    console.log(`✅ Created ${createdClients.length} Clients and ${createdFreelancers.length} Freelancers.`);

    // 2b. Sign in as Admin to allow writing to Firestore (bypass rules)
    console.log("Signing in as Admin for bulk inserts...");
    try {
        await signInWithEmailAndPassword(auth, "admin@demo.com", password);
    } catch (e) {
        console.error("Failed to sign in as admin for seeding:", e);
    }

    // 3. Create Jobs (20 Total)
    console.log("Creating Jobs...");
    const jobIds: string[] = [];

    for (let i = 0; i < 20; i++) {
        const clientUid = getRandom(createdClients);
        const title = `${getRandom(CATEGORIES)} Expert Needed for ${getRandom(SKILLS)} Project`;
        const jobId = `job-seed-${i}`;

        await setDoc(doc(db, "jobs", jobId), {
            jobId,
            clientId: clientUid,
            clientName: "Demo Client", // Ideally fetch real name but Seed script simplicity
            title: title + " " + i,
            description: getRandom(JOB_DESCRIPTIONS) + " Must have experience with " + getRandom(SKILLS),
            category: getRandom(CATEGORIES),
            budget: (Math.floor(Math.random() * 20) + 1) * 100, // 100 - 2000
            deadline: Date.now() + (Math.floor(Math.random() * 30) + 5) * 86400000,
            skills: getRandomSubarray(SKILLS, 3),
            status: "open",
            createdAt: Date.now() - Math.floor(Math.random() * 10) * 86400000
        });
        jobIds.push(jobId);
    }

    // 4. Create Proposals (30 Total)
    console.log("Creating Proposals...");
    for (let i = 0; i < 30; i++) {
        const jobId = getRandom(jobIds);
        const freelancerUid = getRandom(createdFreelancers);

        // Random Status
        const statusPool = ["pending", "pending", "pending", "rejected", "accepted"];
        const status = getRandom(statusPool);

        await addDoc(collection(db, "proposals"), {
            jobId,
            freelancerId: freelancerUid,
            freelancerName: "Demo Freelancer",
            message: "I am perfect for this job. I have done similar projects.",
            quote: (Math.floor(Math.random() * 10) + 1) * 50,
            estimatedDays: Math.floor(Math.random() * 14) + 1,
            status,
            createdAt: Date.now()
        });

        // If status is accepted, create an ORDER strictly if one doesn't exist? 
        // For simplicity, we'll create separate Orders in step 5 to ensure clean data for the "Orders" tab
    }

    // 5. Create Orders (15 Total) - Independent of the proposals above to guarantee 15 orders
    console.log("Creating Orders...");
    const orderStatuses = ["awaiting_payment", "active", "active", "delivered", "completed", "cancelled"];

    for (let i = 0; i < 15; i++) {
        const status = getRandom(orderStatuses);
        const client = getRandom(createdClients);
        const freelancer = getRandom(createdFreelancers);
        const jobId = getRandom(jobIds);

        const orderRef = doc(collection(db, "orders"));
        await setDoc(orderRef, {
            orderId: orderRef.id,
            jobId,
            clientId: client,
            freelancerId: freelancer,
            price: (Math.floor(Math.random() * 10) + 1) * 100,
            status,
            createdAt: Date.now() - Math.floor(Math.random() * 20) * 86400000
        });

        // 6. Create Review (If Completed)
        if (status === 'completed') {
            await addDoc(collection(db, "reviews"), {
                reviewId: `review-${i}`,
                orderId: orderRef.id,
                reviewerId: client,
                targetId: freelancer,
                rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
                comment: "Great work! Highly recommended.",
                createdAt: Date.now()
            });
        }
    }

    console.log("✅ Seed Complete! Database populated with:");
    console.log(`- ${createdClients.length} Clients`);
    console.log(`- ${createdFreelancers.length} Freelancers`);
    console.log(`- 20 Jobs`);
    console.log(`- 30 Proposals`);
    console.log(`- 15 Orders`);

    process.exit(0);
};

seedData();
