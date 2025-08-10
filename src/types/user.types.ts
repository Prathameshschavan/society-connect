/* eslint-disable @typescript-eslint/no-explicit-any */
export type TSignIn = {
  phone: string;
  password: string;
};

// types/auth.types.ts
export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  address?: string;
  total_units: number;
  maintenance_rate: number;
  maintenance_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id?: string;
  role: 'super_admin' | 'admin' | 'resident';
  full_name: string;
  phone: string;
  unit_number?: string;
  square_footage?: number;
  must_change_password: boolean;
  security_question?: string;
  security_answer_hash?: string;
  created_at: string;
  updated_at: string;
  organizations?: Organization;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<{ data: any; error: any; profile?: Profile | null; }>;
  signOut: () => Promise<{ error: unknown }>;
  fetchUserProfile: (userId: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
}

