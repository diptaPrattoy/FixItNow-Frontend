export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";

export type TechnicianProfile = {
  id: string;
  bio: string | null;
  experienceYears: number;
  location: string;
  averageRating: string;
  reviewCount: number;
  isVerified: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  technicianProfile: TechnicianProfile | null;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorPayload = {
  success: false;
  message: string;
  errorDetails?: ApiFieldError[] | Record<string, unknown> | null;
};
