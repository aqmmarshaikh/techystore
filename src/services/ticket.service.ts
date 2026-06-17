import { collection, query, getDocs, getDoc, addDoc, doc, updateDoc, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { NotificationService } from "@/services/notification.service";

const TICKET_COLLECTION = "tickets";

export interface SupportTicket {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Waiting for Customer" | "Resolved" | "Closed";
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export class TicketService {
  static async createTicket(ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "status" | "priority">) {
    const docRef = await addDoc(collection(db, TICKET_COLLECTION), {
      ...ticket,
      priority: "Medium",
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Notify Admin
    await NotificationService.createNotification({
      recipientId: "ADMIN_ALL",
      recipientRole: "admin",
      type: "Support Ticket",
      title: "New Support Ticket",
      message: `${ticket.userName} requires assistance: ${ticket.subject}`,
      referenceId: docRef.id,
      referenceType: "ticket",
      actionUrl: "/admin/dashboard/tickets"
    });

    return docRef.id;
  }

  static async getAllTickets() {
    const q = query(
      collection(db, TICKET_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
  }

  static async getUserTickets(userId: string) {
    const q = query(
      collection(db, TICKET_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
  }

  static async updateTicket(id: string, updates: Partial<SupportTicket>) {
    const docRef = doc(db, TICKET_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    try {
      const ticketDoc = await getDoc(docRef);
      if (ticketDoc.exists()) {
        const data = ticketDoc.data() as SupportTicket;
        if (data.userId && (updates.status || updates.adminNotes)) {
          let title = "Support Ticket Updated";
          let message = `Your support ticket regarding "${data.subject}" has been updated.`;

          if (updates.status === "Resolved") {
            title = "Support Ticket Resolved";
            message = `Your support ticket regarding "${data.subject}" has been marked as resolved.`;
          }

          await NotificationService.createNotification({
            recipientId: data.userId,
            recipientRole: "customer",
            type: "Support",
            title,
            message,
            referenceId: id,
            referenceType: "ticket",
            actionUrl: `/profile`
          });
        }
      }
    } catch (e) {
      console.error("Failed to send ticket notification", e);
    }
  }
}
