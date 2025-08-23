// 認証関連の型定義

// データモデル
export interface User {
  USERID: number;
  USERNAME: string;
  MAILADDRESS: string;
  CREATEDATE: string;
  UPDATEDATE: string;
}

export interface UserProfile {
  mailAddress: string;
  password: string;
  pastCnt: number;
}

// API パラメータ
export interface LoginPayload {
  userName: string;
  password: string;
}

export interface SignUpPayload {
  userName: string;
  password: string;
  mailAddress: string;
}

export interface ChangeProfilePayload {
  mailAddress: string;
  password: string;
}

export interface ResetPasswordPayload {
  userName: string;
  mailAddress: string;
}

// フォームデータ
export interface LoginFormData {
  userName: string;
  password: string;
}

export interface SignUpFormData {
  userName: string;
  password: string;
  mailAddress: string;
}

export interface ChangeProfileFormData {
  mailAddress: string;
  password1: string;
  password2: string;
}

export interface ResetPasswordFormData {
  userName: string;
  mailAddress: string;
}

// 認証状態
export interface AuthState {
  checked: boolean;
  isAuthenticated: boolean;
}

// セッション情報
export interface SessionInfo {
  secK: string;
  userInfo: User;
}
