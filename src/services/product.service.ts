import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";

export const ProductService = {
  /**
   * Get a list of active products with optional filters
   */
  async getProducts(options?: {
    categoryId?: string;
    limitCount?: number;
    sortBy?: "newest" | "price_asc" | "price_desc" | "rating";
  }): Promise<Product[]> {
    try {
      let q = query(collection(db, "products"), where("isActive", "==", true));

      if (options?.categoryId) {
        q = query(q, where("categoryId", "==", options.categoryId));
      }

      if (options?.sortBy) {
        switch (options.sortBy) {
          case "newest":
            q = query(q, orderBy("createdAt", "desc"));
            break;
          case "price_asc":
            q = query(q, orderBy("price", "asc"));
            break;
          case "price_desc":
            q = query(q, orderBy("price", "desc"));
            break;
          case "rating":
            q = query(q, orderBy("rating", "desc"));
            break;
        }
      } else {
        // Default sort
        q = query(q, orderBy("createdAt", "desc"));
      }

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      } else {
        q = query(q, limit(20)); // Part 19 Performance Optimization
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().isActive) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  /**
   * Get featured products for the homepage
   */
  async getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const q = query(
        collection(db, "products"),
        where("isActive", "==", true),
        where("featured", "==", true),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const { addDoc } = await import("firebase/firestore");
      const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      const { updateDoc } = await import("firebase/firestore");
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
};
