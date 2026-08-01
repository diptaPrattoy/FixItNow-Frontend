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
  meta?: PaginationMeta;
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

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  _count: {
    services: number;
  };
};

export type PublicTechnicianSummary = {
  id: string;
  location: string;
  averageRating: string;
  reviewCount: number;
  isVerified: boolean;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  technician: PublicTechnicianSummary;
};

export type TechnicianListItem = {
  id: string;
  bio: string | null;
  experienceYears: number;
  location: string;
  averageRating: string;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    price: string;
    durationMinutes: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

export type TechnicianDetails = {
  id: string;
  bio: string | null;
  experienceYears: number;
  location: string;
  averageRating: string;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string;
    durationMinutes: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  availabilitySlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    customer: {
      name: string;
      avatarUrl: string | null;
    };
  }>;
};
