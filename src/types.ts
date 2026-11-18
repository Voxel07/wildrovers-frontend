// Shapes of the JSON the backend returns. Fields the backend may leave out (or that only
// some endpoints fill in) are optional. Dates: epoch ms (number) or ISO strings for
// LocalDate / LocalDateTime values.

export interface Address {
  id?: number;
  street?: string | null;
  state?: string | null;
  postcode?: number | null;
  streetNumber?: number | null;
  addressSupplements?: string | null;
}

export interface Phone {
  id?: number;
  number: string;
  type?: string | null;
}

export interface User {
  id: number;
  email?: string | null;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  isActive?: boolean;
  active?: boolean;
  lastLogin?: number | null;
  lastLoginIp?: string | null;
  lastLoginCountry?: string | null;
  regDate?: number | null;
  address?: Address | null;
  photoUrl?: string | null;
  backgroundUrl?: string | null;
  phrase?: string | null;
  /** yyyy-MM-dd */
  birthday?: string | null;
  visitedOps?: number | null;
  ribbon?: string | null;
  yearlyFeePaid?: boolean;
  yearlyFees?: Array<{ id?: number; feeYear: number }>;
  hasPaidCurrentYear?: boolean;
  paidYears?: number[];
  pendingEmail?: string | null;
  canCreateCategory?: boolean;
  isBlocked?: boolean;
  eventsAttended?: number;
  forumPostCount?: number;
  forumAnswerCount?: number;
  forumTopicCount?: number;
  forumCategoryCount?: number;
  lastForumActivity?: number | null;
  phones?: Phone[];
  oidcLinked?: boolean;
  [key: string]: unknown;
}

/** GET /user/me?stats=true */
export interface UserWithStats extends User {
  /** Attended events per year, e.g. { "2025": 4, "2026": 2 } */
  eventsAttendedByYear?: Record<string, number>;
}

export interface ForumCategory {
  id: number;
  category: string;
  creationDate?: number;
  topicCount?: number;
  position?: number;
  visibility?: string | null;
  /** User name of the creator, "deleted" for removed accounts. */
  creator?: string;
  [key: string]: unknown;
}

export interface LatestPost {
  id: number;
  title: string;
  creator: string;
  creationDate: number;
}

/** Event handlers that only need to stop the click from reaching the row behind. */
export interface StoppableEvent {
  stopPropagation(): void;
}

export interface ForumTopic {
  id: number;
  topic: string;
  creationDate?: number;
  postCount?: number;
  views?: number;
  /** User name of the creator, "deleted" for removed accounts. */
  creator?: string;
  categoryId?: number;
  categoryName?: string;
  latestPost?: LatestPost | null;
  allViewed?: boolean | null;
  /** Set on a topic shown before the server confirmed it. */
  isOptimistic?: boolean;
  [key: string]: unknown;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  creationDate: number;
  editDate?: number | null;
  views?: number;
  likes?: number;
  dislikes?: number;
  answerCount?: number;
  /** User name of the creator, "deleted" for removed accounts. */
  creator?: string;
  creatorPhotoUrl?: string | null;
  viewed?: boolean;
  topicId?: number;
  topicName?: string;
  categoryId?: number;
  categoryName?: string;
  polls?: Poll[];
  [key: string]: unknown;
}

export interface ForumAnswer {
  id: number;
  content: string;
  creationDate: number;
  editDate?: number | null;
  likes?: number;
  dislikes?: number;
  /** User name of the creator, "deleted" for removed accounts. */
  creator?: string;
  [key: string]: unknown;
}

export interface PollOption {
  id: number;
  optionText: string;
  votes: number;
  /** yyyy-MM-dd */
  optionDate?: string | null;
  /** yyyy-MM-dd */
  optionEndDate?: string | null;
  eventId?: number | null;
  voterNames?: string[] | null;
  [key: string]: unknown;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  allowMultiple?: boolean;
  anonymous?: boolean;
  [key: string]: unknown;
}

export type AttendanceStatus = 'YES' | 'NO' | 'MAYBE';

export interface EventAttendance {
  id?: number;
  status: AttendanceStatus | string;
  userId?: number;
  userName?: string;
  [key: string]: unknown;
}

export interface WrEvent {
  id: number;
  title: string;
  description?: string | null;
  /** ISO LocalDateTime */
  eventDate: string;
  /** ISO LocalDateTime */
  eventEndDate?: string | null;
  location?: string | null;
  googleCalendarEventId?: string | null;
  creatorName?: string | null;
  forumPostUrl?: string | null;
  forumPostId?: number | null;
  attendances?: EventAttendance[];
  nonRespondents?: string[];
  [key: string]: unknown;
}

export interface GalleryEntry {
  id: number;
  title: string;
  url: string;
  /** yyyy-MM-dd */
  date?: string | null;
  location?: string | null;
  creatorName?: string | null;
  [key: string]: unknown;
}

/** Severity of a message shown by AlertsManager. */
export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';
