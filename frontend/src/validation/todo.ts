import yup from '../yup/yup.jp';

// Todo作成・更新フォームのバリデーションスキーマ
export const todoFormSchema = yup.object({
  title: yup.string().label('Title欄').required(),
  text: yup.string().label('Text欄').required(),
  category: yup.string().label('Category欄').required(),
  priority: yup.string().label('Priority欄').required(),
  able: yup.number().label('Able欄').integer().min(0).max(1).required(),
  tCycles: yup.string().label('Cycles欄').required(),
  tDate: yup.string().label('Date欄'),
  tMonth: yup.array().of(yup.string()),
  tWeek: yup.array().of(yup.string()),
  tWeekDay: yup.array().of(yup.string()),
  tDay: yup.array().of(yup.string()),
  tAlertDay: yup.number().label('Alert Day欄').integer().min(0).required()
});

// Todo検索フォームのバリデーションスキーマ
export const todoSearchSchema = yup.object({
  searchWord: yup.string().label('検索項目').allowAlphaNumJapan()
});

// Todo日設定作成フォームのバリデーションスキーマ
export const todoDaySetSchema = yup.object({
  targetPriority: yup.array().of(yup.string()).label('Priority欄').required(),
  targetDate: yup.string().label('Date欄').required()
});

// Todo関連の型定義
export type TodoFormData = yup.InferType<typeof todoFormSchema>;
export type TodoSearchData = yup.InferType<typeof todoSearchSchema>;
export type TodoDaySetData = yup.InferType<typeof todoDaySetSchema>;
