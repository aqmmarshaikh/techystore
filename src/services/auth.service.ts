import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { UserProfile } from "@/store/authStore";
import { NotificationService } from "@/services/notification.service";

const googleProvider = new GoogleAuthProvider();

export const AuthService = {
  /**
   * Register a new user with Email and Password
   */
  async registerWithEmail(data: { email: string; password: string; name: string }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });

      // Create Firestore document for the user
      const userProfile: UserProfile = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: "customer", // Default role
        addresses: [],
        wishlist: [],
        recentlyViewed: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      // Notification for customer
      await NotificationService.createNotification({
        recipientId: user.uid,
        recipientRole: "customer",
        type: "Account",
        title: "Welcome to FreshMart!",
        message: `Hi ${data.name}, welcome to FreshMart. We're glad to have you here!`,
        actionUrl: "/profile"
      });

      // Notification for admin
      await NotificationService.createNotification({
        recipientId: "ADMIN_ALL",
        recipientRole: "admin",
        type: "New User",
        title: "New User Registration",
        message: `A new user ${data.name} (${data.email}) just registered.`,
        actionUrl: "/admin/dashboard/customers"
      });

      return { user, profile: userProfile };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with Email and Password
   */
  async loginWithEmail(data: { email: string; password: string }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login/Register with Google
   */
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // First time login, create Firestore document
        const userProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          role: "customer",
          addresses: [],
          wishlist: [],
          recentlyViewed: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, userProfile);

        // Notification for customer
        await NotificationService.createNotification({
          recipientId: user.uid,
          recipientRole: "customer",
          type: "Account",
          title: "Welcome to FreshMart!",
          message: `Hi ${user.displayName || 'User'}, welcome to FreshMart. We're glad to have you here!`,
          actionUrl: "/profile"
        });

        // Notification for admin
        await NotificationService.createNotification({
          recipientId: "ADMIN_ALL",
          recipientRole: "admin",
          type: "New User",
          title: "New User Registration",
          message: `A new user ${user.displayName || 'User'} (${user.email || ''}) just registered via Google.`,
          actionUrl: "/admin/dashboard/customers"
        });

        return { user, profile: userProfile };
      }

      return { user, profile: userDocSnap.data() as UserProfile };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send Password Reset Email
   */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update Profile
   */
  async updateUserProfile(uid: string, data: { name?: string; phone?: string }) {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, data);
      
      // Update Auth Profile if name changed
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add Address
   */
  async addAddress(uid: string, address: any) {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        addresses: arrayUnion(address)
      });
    } catch (error) {
      throw error;
    }
  }
};
