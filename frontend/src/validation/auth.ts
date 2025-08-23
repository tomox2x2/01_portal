import yup from '../yup/yup.jp';

// ログインフォームのバリデーションスキーマ
export const loginFormSchema = yup.object({
  userName: yup.string().label('ユーザ名').required(),
  password: yup.string().label('パスワード').required()
});

// 新規登録フォームのバリデーションスキーマ
export const signUpFormSchema = yup.object({
  userName: yup.string().label('ユーザ名').required().max(255).allowAlphaNum(),
  mailAddress: yup.string().label('メールアドレス').required().email(),
  password1: yup.string().label('パスワード').required().min(8).max(20).matches(/^[0-9a-zA-Z-@_\\.]+$/,"半角英数字、記号「_」「.」「@」「-」"),
  password2: yup.string().label('パスワード(確認用)').required().min(8).max(20)
    .test('matchPass1',"「パスワード」項目と違う文字列が設定されています",
      function(value) {
        if (this.parent.password1 !== value) {
          return false;
        }
        return true;
      })
});

// ユーザ情報変更フォームのバリデーションスキーマ
export const changeProfileSchema = yup.object({
  mailAddress: yup.string().label('メールアドレス').email().required(),
  password1: yup.string().label('パスワード').min(8).required(),
  password2: yup.string().label('パスワード確認').oneOf([yup.ref('password1')], 'パスワードが一致しません').required()
});

// パスワードリセットフォームのバリデーションスキーマ
export const resetPasswordSchema = yup.object({
  userName: yup.string().label('ユーザ名').allowAlphaNum().required(),
  mailAddress: yup.string().label('メールアドレス').email().required()
});

// 認証関連の型定義
export type LoginFormData = yup.InferType<typeof loginFormSchema>;
export type SignUpFormData = yup.InferType<typeof signUpFormSchema>;
export type ChangeProfileData = yup.InferType<typeof changeProfileSchema>;
export type ResetPasswordData = yup.InferType<typeof resetPasswordSchema>;
