// src/types/auth.ts

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating?: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}