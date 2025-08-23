// Todo関連の型定義

// データモデル
export interface TodoBase {
  TODOID: number;
  TITLE: string;
  TEXT: string;
  CATEGORY: string;
  PRIORITY: string;
  ABLE: number;
  CREATEDATE: string;
  UPDATEDATE: string;
}

export interface TodoDetail {
  TODOID: number;
  TITLE: string;
  TEXT: string;
  CATEGORY: string;
  PRIORITY: string;
  ABLE: number;
  CREATEDATE: string;
  UPDATEDATE: string;
  FREQTYPE: number;
  FREQDATE: string;
  FREQMONTH: string;
  FREQWEEK: string;
  FREQWEEKDAY: string;
  FREQDAY: string;
  ALERTDAY: number;
}

export interface TodoListItem {
  TODOID: number;
  TITLE: string;
  TEXT: string;
  CATEGORY: string;
  PRIORITY: string;
  ABLE: number;
  CREATEDATE: string;
  UPDATEDATE: string;
  FREQTYPE: number;
  FREQDATE: string;
  FREQMONTH: string;
  FREQWEEK: string;
  FREQWEEKDAY: string;
  FREQDAY: string;
  ALERTDAY: number;
}

export interface TodoCategory {
  CATEGORYID: number;
  CATEGORYNAME: string;
}

// API パラメータ
export interface TodoListParams {
  searchWord: string;
  targetCategory: string;
}

export interface TodoItemParams {
  targetPriority: string[];
  targetDate: string;
}

export interface CreateTodoPayload {
  title: string;
  text: string;
  category: string;
  priority: string;
  able: number;
  tCycles: string;
  tDate: string;
  tMonth: string[];
  tWeek: string[];
  tWeekDay: string[];
  tDay: string[];
  tAlertDay: number;
}

export interface UpdateTodoPayload {
  todoId: number;
  title: string;
  text: string;
  category: string;
  priority: string;
  able: number;
  tCycles: string;
  tDate: string;
  tMonth: string[];
  tWeek: string[];
  tWeekDay: string[];
  tDay: string[];
  tAlertDay: number;
}

export interface DeleteTodoPayload {
  todoId: number;
}

export interface CreateDaySetPayload {
  targetPriority: string[];
  targetDate: string;
}

// フォームデータ
export interface TodoFormData {
  title: string;
  text: string;
  category: string;
  priority: string;
  able: number;
  tCycles: string;
  tDate: string;
  tMonth: string[];
  tWeek: string[];
  tWeekDay: string[];
  tDay: string[];
  tAlertDay: number;
}

// モーダル状態
export interface TodoModalState {
  mode: number;
  id: number;
}

export interface TodoDaySetModalState {
  mode: number;
}

// 検索フォーム
export interface TodoSearchFormData {
  searchWord: string;
}

// オプション
export interface OptionType {
  value: string;
  label: string;
}
