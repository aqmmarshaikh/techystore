import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

import { NotificationService } from "@/services/notification.service";

const COLLECTION_NAME = "orders";

export class OrderService {
  static async getAllOrders() {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getOrdersByUserId(userId: string) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually to avoid requiring a Firebase composite index
    return orders.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  static async getOrderById(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  static async createOrder(data: any) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    
    // Notification for customer
    if (data.userId) {
      await NotificationService.createNotification({
        recipientId: data.userId,
        recipientRole: "customer",
        type: "Order Placed",
        title: "Order Placed",
        message: `Your order #${docRef.id.slice(0,8).toUpperCase()} has been placed successfully.`,
        referenceId: docRef.id,
        referenceType: "order",
        actionUrl: `/orders/${docRef.id}`
      });
    }

    // Notification for admin
    await NotificationService.createNotification({
      recipientId: "ADMIN_ALL",
      recipientRole: "admin",
      type: "New Order",
      title: "New Order Received",
      message: `A new order worth ₹${data.totalAmount} has been placed.`,
      referenceId: docRef.id,
      referenceType: "order",
      actionUrl: `/admin/dashboard/orders`
    });

    return docRef.id;
  }

  static async updateOrderStatus(id: string, status: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
    
    try {
      const orderDoc = await getDoc(docRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        if (orderData.userId) {
          let title = `Order ${status}`;
          let message = `Your order #${id.slice(0,8).toUpperCase()} is now ${status}.`;
          
          if (status.toLowerCase() === "shipped") message = `Your order #${id.slice(0,8).toUpperCase()} has been shipped and is on its way.`;
          if (status.toLowerCase() === "delivered") message = `Your order #${id.slice(0,8).toUpperCase()} has been delivered successfully.`;
          
          await NotificationService.createNotification({
            recipientId: orderData.userId,
            recipientRole: "customer",
            type: "Order Status",
            title,
            message,
            referenceId: id,
            referenceType: "order",
            actionUrl: `/orders/${id}`
          });
        }
      }
    } catch (e) {
      console.error("Failed to send order status notification", e);
    }
  }
}
