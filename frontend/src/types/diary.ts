// Diary関連の型定義

// データモデル
export interface Diary {
  DIARYID: number;
  TITLE: string;
  TEXT: string;
  CREATEDATE: string;
  UPDATEDATE: string;
}

export interface DiaryIndexItem {
  CREATEMONTH: string;
}

// API パラメータ
export interface DiaryListParams {
  searchWord: string;
  targetMonth: string;
}

export interface CreateDiaryPayload {
  title: string;
  text: string;
}

export interface UpdateDiaryPayload {
  diaryId: number;
  title: string;
  text: string;
}

export interface DeleteDiaryPayload {
  diaryId: number;
  title: string;
}

// フォームデータ
export interface DiaryFormData {
  title: string;
  text: string;
}

// モーダル状態
export interface DiaryModalState {
  mode: number;
  id: number;
}

// 検索フォーム
export interface SearchFormData {
  searchWord: string;
}
