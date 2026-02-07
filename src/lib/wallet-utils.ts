import { db } from "./firebase";
import { doc, getDoc, updateDoc, collection, addDoc, runTransaction, increment } from "firebase/firestore";
import { Transaction, Wallet } from "@/types";

/**
 * Records a transaction and updates the user's wallet balance atomically.
 */
export async function processWalletTransaction(transaction: Omit<Transaction, 'transactionId' | 'createdAt'>) {
    try {
        const userRef = doc(db, 'users', transaction.userId);

        await runTransaction(db, async (dbTransaction) => {
            const userSnap = await dbTransaction.get(userRef);
            if (!userSnap.exists()) throw new Error("User not found");

            const userData = userSnap.data();
            const currentWallet: Wallet = userData.wallet || {
                availableBalance: 0,
                lockedBalance: 0,
                currency: 'LKR',
                lastUpdated: Date.now()
            };

            // Calculate new balances based on transaction type
            let newAvailable = currentWallet.availableBalance;
            let newLocked = currentWallet.lockedBalance;

            switch (transaction.type) {
                case 'deposit':
                    newAvailable += transaction.amount;
                    break;
                case 'escrow_hold':
                    // From client's perspective (usually handled by external gateway)
                    // But if using internal funds:
                    if (newAvailable < transaction.amount) throw new Error("Insufficient funds");
                    newAvailable -= transaction.amount;
                    newLocked += transaction.amount;
                    break;
                case 'escrow_release':
                    // From freelancer's perspective (funds move to available)
                    newLocked -= transaction.amount;
                    newAvailable += transaction.amount;
                    break;
                case 'withdrawal':
                    if (newAvailable < transaction.amount) throw new Error("Insufficient funds");
                    newAvailable -= transaction.amount;
                    break;
                case 'refund':
                    newAvailable += transaction.amount;
                    break;
            }

            // Update Wallet
            dbTransaction.update(userRef, {
                wallet: {
                    ...currentWallet,
                    availableBalance: newAvailable,
                    lockedBalance: newLocked,
                    lastUpdated: Date.now()
                }
            });

            // Create Transaction Record
            const transRef = collection(db, 'transactions');
            dbTransaction.set(doc(transRef), {
                ...transaction,
                createdAt: Date.now()
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Wallet transaction failed:", error);
        throw error;
    }
}

/**
 * Specialized function to handle Escrow Hold for a new Order.
 */
export async function holdEscrow(orderId: string, clientId: string, amount: number) {
    return processWalletTransaction({
        userId: clientId,
        orderId,
        amount,
        type: 'escrow_hold',
        status: 'completed',
        gateway: 'payhere'
    });
}
