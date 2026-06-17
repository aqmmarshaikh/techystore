import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";

export const StorageService = {
  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The path in storage (e.g. 'products/images')
   * @returns Promise that resolves to the download URL
   */
  async uploadFile(file: File, path: string): Promise<string> {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, `${path}/${filename}`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress monitoring could be added here
          // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  /**
   * Delete a file from Firebase Storage given its URL
   */
  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Create a reference from the URL
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
};
