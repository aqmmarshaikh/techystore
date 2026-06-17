import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  limit, 
  addDoc,
  onSnapshot,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "@/firebase/config";

const COLLECTION_NAME = "notifications";

export interface AppNotification {
  id?: string;
  recipientId: string;
  recipientRole: "customer" | "admin";
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  icon?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// These empty interfaces exist to keep profile/page.tsx from breaking if it still references them.
export interface NotificationPreferences {}
export class NotificationSettingsService {
  static async getPreferences(userId: string) { return {}; }
  static async updatePreferences(userId: string, prefs: any) {}
}

export class NotificationService {
  
  static async createNotification(data: Omit<AppNotification, "id" | "createdAt" | "isRead">) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static subscribeToUserNotifications(userId: string, callback: (notifications: AppNotification[]) => void, limitCount: number = 20) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("recipientId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      let notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      // Sort and limit client-side to avoid composite indexes
      notifications = notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (limitCount > 0) {
        notifications = notifications.slice(0, limitCount);
      }
      
      callback(notifications);
    });
  }

  static subscribeToAdminNotifications(callback: (notifications: AppNotification[]) => void, limitCount: number = 20) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("recipientRole", "==", "admin")
    );

    return onSnapshot(q, (snapshot) => {
      let notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      // Sort and limit client-side to avoid composite indexes
      notifications = notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (limitCount > 0) {
        notifications = notifications.slice(0, limitCount);
      }
      
      callback(notifications);
    });
  }

  static async markAsRead(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isRead: true });
  }

  static async markAllAsRead(userId: string, role: "customer" | "admin" = "customer") {
    let q;
    if (role === "admin") {
      q = query(collection(db, COLLECTION_NAME), where("recipientRole", "==", "admin"), where("isRead", "==", false));
    } else {
      q = query(collection(db, COLLECTION_NAME), where("recipientId", "==", userId), where("isRead", "==", false));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.update(document.ref, { isRead: true });
    });
    
    await batch.commit();
  }

  static async deleteNotification(id: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
}
