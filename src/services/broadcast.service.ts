import { collection, query, getDocs, addDoc, doc, updateDoc, orderBy, limit, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const BROADCAST_COLLECTION = "broadcasts";

export interface Broadcast {
  id?: string;
  title: string;
  message: string;
  audienceType: string;
  status: "Sending" | "Delivered" | "Scheduled";
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  type?: string;
}

export class BroadcastService {
  static async createBroadcast(broadcast: Omit<Broadcast, "id">) {
    const docRef = await addDoc(collection(db, BROADCAST_COLLECTION), {
      ...broadcast,
      createdAt: new Date().toISOString()
    });

    if (broadcast.status === "Delivered") {
      try {
        const { NotificationService } = await import("@/services/notification.service");
        // Get all users
        const usersSnap = await getDocs(collection(db, "users"));
        
        let targetUsers = usersSnap.docs;
        
        // Very basic audience filtering
        if (broadcast.audienceType === "Customers with Orders") {
          targetUsers = targetUsers.filter(d => (d.data().ordersCount || 0) > 0);
        } else if (broadcast.audienceType === "VIP Customers") {
          targetUsers = targetUsers.filter(d => d.data().isVip);
        }

        // Loop and send Notification to each
        for (const userDoc of targetUsers) {
          await NotificationService.createNotification({
            recipientId: userDoc.id,
            recipientRole: "customer",
            type: broadcast.type || "Broadcast",
            title: broadcast.title,
            message: broadcast.message,
            referenceId: docRef.id,
            referenceType: "broadcast",
            actionUrl: "/profile"
          });
        }
      } catch (e) {
        console.error("Failed to dispatch broadcast notifications", e);
      }
    }

    return docRef.id;
  }

  static async getAllBroadcasts(limitCount = 50) {
    const q = query(
      collection(db, BROADCAST_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broadcast));
  }

  static async getActiveBroadcastsForUser(createdAtThreshold: string) {
    // Only fetch broadcasts that have been delivered, and were created after the user registered
    const q = query(
      collection(db, BROADCAST_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const broadcasts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broadcast));
    
    // Client-side filtering because Firestore doesn't support complex OR / multi-inequality easily
    // We only show broadcasts that are Delivered, and created AFTER the user joined the app.
    return broadcasts.filter(b => 
      b.status === "Delivered" && 
      (!b.sentAt || b.sentAt >= createdAtThreshold)
    );
  }

  static async updateBroadcastStatus(id: string, status: Broadcast["status"]) {
    const docRef = doc(db, BROADCAST_COLLECTION, id);
    await updateDoc(docRef, { status });
  }

  static async deleteBroadcast(id: string) {
    await deleteDoc(doc(db, BROADCAST_COLLECTION, id));
  }

  // Analytics Helpers
  static async markBroadcastAsReadForUser(userId: string, broadcastId: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const readBroadcasts = data.readBroadcasts || [];
      if (!readBroadcasts.includes(broadcastId)) {
        await updateDoc(userRef, {
          readBroadcasts: [...readBroadcasts, broadcastId]
        });
      }
    }
  }

  static async markBroadcastAsDeletedForUser(userId: string, broadcastId: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const deletedBroadcasts = data.deletedBroadcasts || [];
      if (!deletedBroadcasts.includes(broadcastId)) {
        await updateDoc(userRef, {
          deletedBroadcasts: [...deletedBroadcasts, broadcastId]
        });
      }
    }
  }

  static async getBroadcastAnalytics(broadcastId: string) {
    // Note: getCountFromServer is ideal, but for simplicity in client we'll just fetch all users
    // This is safe for a small user base, but in production this should be a Cloud Function
    const snapshot = await getDocs(collection(db, "users"));
    let readCount = 0;
    let totalTargeted = snapshot.docs.length; // Assuming All Users for now

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.readBroadcasts?.includes(broadcastId)) {
        readCount++;
      }
    });

    const unreadCount = totalTargeted - readCount;
    const deliveryPercentage = totalTargeted > 0 ? 100 : 0; // Simplified

    return { totalTargeted, readCount, unreadCount, deliveryPercentage };
  }
}
