import { db } from "./firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FreelancerProfile } from "@/types";

/**
 * Recalculates and updates a freelancer's metrics based on their order history.
 * @param freelancerId The UID of the freelancer
 */
export async function updateFreelancerMetrics(freelancerId: string) {
    try {
        const freelancerRef = doc(db, "freelancerProfiles", freelancerId);
        const freelancerSnap = await getDoc(freelancerRef);

        if (!freelancerSnap.exists()) return;

        // Fetch all orders for this freelancer
        const q = query(collection(db, "orders"), where("freelancerId", "==", freelancerId));
        const ordersSnap = await getDocs(q);
        const orders = ordersSnap.docs.map(doc => doc.data());

        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === "completed").length;
        const cancelledByFreelancer = orders.filter(o => o.status === "cancelled" && o.cancelledBy === "freelancer").length;
        const disputedOrders = orders.filter(o => o.status === "disputed").length;

        // Proposal Metrics
        const propQ = query(collection(db, "proposals"), where("freelancerId", "==", freelancerId));
        const propsSnap = await getDocs(propQ);
        const proposalCount = propsSnap.size;
        const acceptedProposals = propsSnap.docs.filter(d => d.data().status === "accepted").length;
        const acceptanceRate = proposalCount > 0 ? Math.round((acceptedProposals / proposalCount) * 100) : 0;

        // Fair Completion Rate
        const completionRate = totalOrders > 0
            ? Math.round(((totalOrders - (cancelledByFreelancer + disputedOrders)) / totalOrders) * 100)
            : 100;

        // Success Score: weighted by completion, disputes, and proposal quality
        const nonDisputedRate = totalOrders > 0 ? ((totalOrders - disputedOrders) / totalOrders) * 100 : 100;
        // 50% Completion, 30% Non-disputed, 20% Proposal Quality
        const successScore = Math.round((completionRate * 0.5) + (nonDisputedRate * 0.3) + (acceptanceRate * 0.2));

        // Update profile
        await updateDoc(freelancerRef, {
            "metrics.totalOrders": totalOrders,
            "metrics.completionRate": Math.max(0, completionRate),
            "metrics.successScore": Math.max(0, successScore),
            "metrics.disputeCount": disputedOrders,
            "metrics.proposalAcceptanceRate": acceptanceRate,
            "metrics.proposalsSentCount": proposalCount,
            "lastOrderCompletedAt": Date.now()
        });

        console.log(`Updated metrics for freelancer ${freelancerId}: ${successScore}% Success`);
    } catch (error) {
        console.error("Error updating freelancer metrics:", error);
    }
}

/**
 * Recalculates and updates a client's metrics.
 * @param clientId The UID of the client
 */
export async function updateClientMetrics(clientId: string) {
    try {
        const userRef = doc(db, "users", clientId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const q = query(collection(db, "orders"), where("clientId", "==", clientId));
        const ordersSnap = await getDocs(q);
        const orders = ordersSnap.docs.map(doc => doc.data());

        const totalOrders = orders.length;
        const cancelledByClient = orders.filter(o => o.status === "cancelled" && o.cancelledBy === "client").length;
        const disputeCount = orders.filter(o => o.status === "disputed").length;
        const totalSpent = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.price || 0), 0);

        // Trust Score: Lowered by cancellations and disputes
        const penalty = (cancelledByClient * 5) + (disputeCount * 10);
        const trustScore = Math.max(0, 100 - (totalOrders > 0 ? penalty : 0));

        await updateDoc(userRef, {
            clientMetrics: {
                trustScore,
                totalSpent,
                cancelledByClient,
                disputeCount
            }
        });

        console.log(`Updated metrics for client ${clientId}: ${trustScore} Trust`);
    } catch (error) {
        console.error("Error updating client metrics:", error);
    }
}
