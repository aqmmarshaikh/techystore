import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const COLLECTION_NAME = "coupons";

export class CouponService {
  static async getActiveCoupons() {
    const q = query(collection(db, COLLECTION_NAME), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async validateCoupon(code: string) {
    const q = query(collection(db, COLLECTION_NAME), where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return data.isActive ? { id: snapshot.docs[0].id, ...data } : null;
  }

  static async createCoupon(data: { code: string; discountType: string; discountValue: number; minOrderAmount?: number; expiryDate?: string }) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      code: data.code.toUpperCase(),
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  static async deleteCoupon(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isActive: false, deletedAt: new Date().toISOString() });
  }
}
