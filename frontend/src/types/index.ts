export interface KeyMoment {
  time: string;
  label: string;
}

export interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  isVideo: boolean;
  transcription?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  keyMoments?: KeyMoment[];
  createdAt: string;
}

export interface Settings {
  userName: string;
  email: string;
  enableTranscription?: boolean;
}

// Auth types
export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export interface OAuthResponse {
  success: boolean;
  sessionToken: string;
  user: AuthUser;
  expiresIn?: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export interface PricingResponse {
  tiers: PricingTier[];
  comparison: {
    features: string[];
    tiers: Record<string, string[]>;
  };
}