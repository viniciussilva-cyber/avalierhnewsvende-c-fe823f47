import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads an image file to Firebase Storage and returns its public download URL.
 *
 * Images used to be inlined as base64 inside the newsletter HTML, which bloated
 * the Firestore document past its 1MB limit and made saves fail (so readers
 * never saw the images). Storing the file in Storage keeps documents small and
 * the images visible to everyone.
 */
export async function uploadEditorImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `newsletter-images/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
