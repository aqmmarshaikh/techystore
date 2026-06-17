import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Review } from "@/types";

const COLLECTION_NAME = "reviews";

export class ReviewService {
  static async getReviewsByProduct(productId: string) {
    const q = query(collection(db, COLLECTION_NAME), where("productId", "==", productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  }

  static async addReview(reviewData: Omit<Review, "id">) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), reviewData);
    return docRef.id;
  }
}
