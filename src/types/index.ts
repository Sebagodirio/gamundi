export * from "./database";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UnlockResult {
  success: boolean;
  challenge_id?: string;
  points_earned?: number;
  error?: string;
}

export interface AuthState {
  user_id: string | null;
  session_token: string | null;
  is_loading: boolean;
  is_authenticated: boolean;
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };
