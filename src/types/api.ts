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


export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  technicianProfile: {
    id: string;
    location: string;
    experienceYears: number;
    averageRating: string;
    reviewCount: number;
    isVerified: boolean;
  } | null;
  _count: {
    customerBookings: number;
    payments: number;
    reviews: number;
  };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
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


export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED";

export type CustomerBooking = {
  id: string;
  address: string;
  notes: string | null;
  amount: string;
  status: BookingStatus;
  declineReason: string | null;
  cancellationReason: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    price: string;
    durationMinutes: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  technician: {
    id: string;
    location?: string;
    user: {
      id: string;
      name: string;
      email?: string;
      phone?: string | null;
      avatarUrl?: string | null;
    };
  };
  availabilitySlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
  payments?: Array<{
    id: string;
    transactionId: string;
    amount: string;
    status: string;
    provider: string;
    paidAt: string | null;
  }>;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt?: string;
  } | null;
};

export type CustomerReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type TechnicianPrivateProfile = {
  id: string;
  bio: string | null;
  experienceYears: number;
  location: string;
  averageRating: string;
  reviewCount: number;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
};


export type TechnicianAvailabilitySlot = {
  id: string;
  startTime: string;
  endTime: string;
  status?: "AVAILABLE" | "BOOKED" | string;
  createdAt?: string;
  updatedAt?: string;
};

export type TechnicianManagedService = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type TechnicianBooking = {
  id: string;
  address: string;
  notes: string | null;
  amount: string;
  status: BookingStatus;
  declineReason: string | null;
  cancellationReason: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl?: string | null;
  };
  service: {
    id: string;
    name: string;
    price: string;
    durationMinutes: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  availabilitySlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
  payments?: Array<{
    id: string;
    transactionId: string;
    amount: string;
    status: string;
    provider: string;
    paidAt: string | null;
  }>;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type PaymentRecord = {
  id: string;
  transactionId: string;
  amount: string;
  currency?: string;
  provider: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt?: string;
  booking?: {
    id: string;
    status?: BookingStatus;
    service?: {
      id: string;
      name: string;
    };
  };
};

export type PaymentSession = {
  payment: PaymentRecord;
  gatewayPageUrl: string;
};
