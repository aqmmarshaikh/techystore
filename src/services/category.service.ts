import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const COLLECTION_NAME = "categories";

export class CategoryService {
  static async getAllCategories() {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string, name?: string, description?: string, isActive?: boolean }));
  }

  static async getCategoryById(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  static async createCategory(data: { name: string; description: string; isActive: boolean }) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  static async deleteCategory(id: string) {
    // Basic deletion (in a real app, check for products using this category first)
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isActive: false, deletedAt: new Date().toISOString() });
  }
}
