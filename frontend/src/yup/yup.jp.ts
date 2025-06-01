import * as yup from 'yup';

export interface MessageParams {
    path: string; // 変数名
    value: any;
    originalValue: any;
    label: string;
    type: string;
}

yup.addMethod<yup.StringSchema>(yup.string, 'allowAlphaNumJapan', function() {
    return this.test(
        'allowAlphaNumJapan',
        ({label}) => `${label}には英字、数字、全角のいずれかを設定してください。`,
        (value: any) => {
            if(!value) return true;
            return /^[a-zA-Z0-9０-９ａ-ｚＡ-Ｚぁ-んァ-ヶー－\u4E00-\u9FFF\s]+$/.test(value)});
});

yup.addMethod<yup.StringSchema>(yup.string, 'allowAlphaNum', function() {
    return this.test(
        'allowAlphaNum',
        ({label}) => `${label}には半角英数字、「-」「_」「.」のいずれかを設定してください。`,
        (value: any) => {
            if(!value) return true;
            return /^[a-zA-Z0-9-_.\s]+$/.test(value)});
});

const jpLocale = {
    mixed: {
        required: (param : MessageParams) => `${param.label}を入力してください。`,
        oneOf: (param : MessageParams & { values: any }) => `${param.label}は${param.values}のいずれかを設定してください。`,
    },
    string: {
        length: (param : MessageParams & { length: number }) => `${param.label}は${param.length}文字で設定してください。`,
        min: (param : MessageParams & { min: number }) => `${param.label}は${param.min}字以上で設定してください。`,
        max: (param : MessageParams & { max: number }) => `${param.label}は${param.max}字以下で設定してください。`,
        match: (param : MessageParams & { regex: RegExp }) => `${param.label}は「${param.regex}」形式に一致させてください。`,
        matches: (param: MessageParams & { regex: RegExp }) => `${param.label}は「${param.regex}」のいずれかの文字で設定してください。`,
        email: (param : MessageParams) => `${param.label}はメールアドレス形式で設定してください。`,
        url: (param : MessageParams) => `${param.label}はURL形式で設定してください。`,
    },
    number: {
        min: (param : MessageParams & { min: number }) => `${param.label}は${param.min}以上で設定してください。`,
        max: (param : MessageParams & { max: number }) => `${param.label}は${param.max}以下で設定してください。`,
        lessthan: (param : MessageParams & { less: number }) => `${param.label}は${param.less}未満で設定してください。`,
        more: (param : MessageParams & { more: number }) => `${param.label}は${param.more}より大きな値を設定してください。`,
        positive: (param : MessageParams) => `${param.label}は正数を設定してください。`,
        negative: (param : MessageParams) => `${param.label}は負数を設定してください。`,
        integer: (param : MessageParams) => `${param.label}は整数を設定してください`
    },
    date: {
        min: (param : MessageParams & { min: Date | string }) => `${param.label}は${param.min}より未来の日付を設定してください。`,
        max: (param : MessageParams & { max: Date | string }) => `${param.label}は${param.max}より過去の日付を設定してください。`
    },
};

yup.setLocale(jpLocale);

declare module "yup" {
    interface StringSchema<
        TType extends yup.Maybe<string> = string | undefined, 
        TContext extends yup.AnyObject = yup.AnyObject, 
        TDefault = undefined, 
        TFlags = "" 
        > {
        allowAlphaNumJapan():StringSchema<NonNullable<TType>,TContext,TDefault,TFlags>;
        allowAlphaNum():StringSchema<NonNullable<TType>,TContext,TDefault,TFlags>;
    }
}


export default yup;