export enum AuthState {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  DASHBOARD = 'DASHBOARD'
}

export type Language = 'it' | 'en';

export type Theme = 'light' | 'dark' | 'auto';

export interface ComparisonResult {
  winner: string;
  summary: string;
  details: string[];
}