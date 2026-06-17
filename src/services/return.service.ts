import { collection, addDoc, query, where, getDocs, getDoc, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { NotificationService } from "@/services/notification.service";

const COLLECTION_NAME = "returnRequests";

export class ReturnRequestService {
  static async createReturnRequest(data: any) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    // Notify Customer
    if (data.userId) {
      await NotificationService.createNotification({
        recipientId: data.userId,
        recipientRole: "customer",
        type: "Return Request",
        title: "Return Request Submitted",
        message: `Your return request for "${data.productTitle}" has been received and is pending review.`,
        referenceId: docRef.id,
        referenceType: "return",
        actionUrl: `/profile`
      });
    }

    // Notify Admin
    await NotificationService.createNotification({
      recipientId: "ADMIN_ALL",
      recipientRole: "admin",
      type: "Return Request",
      title: "New Return Request",
      message: `A new return request has been submitted for ${data.productTitle}.`,
      referenceId: docRef.id,
      referenceType: "return",
      actionUrl: `/admin/dashboard/returns`
    });

    return docRef.id;
  }

  static async getReturnsByUser(userId: string) {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getAllReturns() {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateReturnStatus(id: string, status: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });

    try {
      const returnDoc = await getDoc(docRef);
      if (returnDoc.exists()) {
        const data = returnDoc.data();
        if (data.userId) {
          let title = `Return ${status.charAt(0).toUpperCase() + status.slice(1)}`;
          let message = `Your return request for "${data.productTitle}" has been ${status}.`;

          if (status.toLowerCase() === "approved") {
            title = "Return Approved";
            message = `Good news! Your return request for "${data.productTitle}" has been approved.`;
          } else if (status.toLowerCase() === "rejected") {
            title = "Return Rejected";
            message = `Unfortunately, your return request for "${data.productTitle}" has been rejected.`;
          } else if (status.toLowerCase() === "completed") {
            title = "Refund Processed";
            message = `Your return request for "${data.productTitle}" is complete and the refund has been processed.`;
          }

          await NotificationService.createNotification({
            recipientId: data.userId,
            recipientRole: "customer",
            type: "Return Status",
            title,
            message,
            referenceId: id,
            referenceType: "return",
            actionUrl: `/profile`
          });
        }
      }
    } catch (e) {
      console.error("Failed to send return status notification", e);
    }
  }

  static async updateReturnNotes(id: string, adminNotes: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { adminNotes, updatedAt: new Date().toISOString() });
  }
}
