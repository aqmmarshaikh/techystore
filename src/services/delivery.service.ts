import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

const COLLECTION_NAME = "deliverySlots";

export class DeliverySlotService {
  static async getAvailableSlots() {
    const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    // If no slots exist, return default mocked slots
    if (snapshot.empty) {
      return [
        { id: "1", label: "Morning (8 AM - 12 PM)", order: 1 },
        { id: "2", label: "Afternoon (12 PM - 4 PM)", order: 2 },
        { id: "3", label: "Evening (4 PM - 8 PM)", order: 3 },
      ];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
