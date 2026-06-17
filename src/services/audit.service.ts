import { collection, addDoc, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

const COLLECTION_NAME = "auditLogs";

export interface AuditLog {
  id?: string;
  action: string;
  entityType: "Product" | "Order" | "Coupon" | "Return" | "Broadcast" | "System";
  entityId?: string;
  details: string;
  adminId: string;
  timestamp: string;
}

export class AuditService {
  static async logAction(log: Omit<AuditLog, "id" | "timestamp">) {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...log,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to log audit action", error);
    }
  }

  static async getLogs(limitCount = 100) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  }
}
