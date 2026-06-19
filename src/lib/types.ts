export type NewsletterStatus = "draft" | "published";

export interface Newsletter {
  /** Friendly slug used as the Firestore document id, e.g. "julho-2026" */
  id: string;
  title: string;
  monthYear: string;
  /** Rich HTML content */
  content: string;
  status: NewsletterStatus;
  createdAt?: number;
}

export interface Evaluation {
  id?: string;
  newsletterId: string;
  /** 0 to 10 */
  rating: number;
  name: string;
  role: string;
  comment?: string;
  /** epoch millis */
  date: number;
}
