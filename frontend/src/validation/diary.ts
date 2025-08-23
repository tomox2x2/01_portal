import yup from '../yup/yup.jp';

// Diary作成・更新フォームのバリデーションスキーマ
export const diaryFormSchema = yup.object({
  title: yup.string().label('Title欄').required(),
  text: yup.string().label('Text欄').required()
});

// Diary検索フォームのバリデーションスキーマ
export const diarySearchSchema = yup.object({
  searchWord: yup.string().label('検索項目').allowAlphaNumJapan()
});

// Diary関連の型定義
export type DiaryFormData = yup.InferType<typeof diaryFormSchema>;
export type DiarySearchData = yup.InferType<typeof diarySearchSchema>;
