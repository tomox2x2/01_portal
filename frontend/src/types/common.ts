// 共通の型定義

// ログ関連
export interface LogInfo {
  TIME: string;
  DETAIL: string;
}

// ワード関連
export interface Word {
  WORD: string;
  WRITEN: string;
}

// コンポーネントのProps
export interface HeaderProps {
  strPageName: string;
}

export interface FooterProps {
  // 必要に応じて追加
}

// モーダル状態の共通型
export interface ModalState {
  mode: number;
  id: number;
}

// 検索状態
export interface SearchState {
  searchWord: string;
}

// ページネーション
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

// API レスポンスの共通型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// エラー状態
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

// ローディング状態
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

// フォームの共通型
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}
