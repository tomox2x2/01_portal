import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../yup/yup.jp';
import { encrypt } from '../api/crypt';
import { useNavigate } from 'react-router-dom';
import { connBackendPost } from '../api/conn';
import { screenInfo,screenAct } from '../state/baseInfo';

const schema = yup.object({
    userName: yup.string().label('ユーザ名').required().max(255).allowAlphaNum(),
    mailAddress:yup.string().label('メールアドレス').required().email(),
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

export default function CompNewAccount() {

    const [errMsgUserName, setMsgUserName] = useState("");
    const [errMsgMailAdd, setMsgMailAdd] = useState("");

    const navigate = useNavigate();

    const errMsg = () => {
        alert('登録できませんでした。\n入力項目のメッセージを参考に、入力内容を見直してください。');
    }

    const { register, handleSubmit, formState: {errors} } = useForm({
        defaultValues: {
            userName:'',
            mailAddress:'',
            password1:'',
            password2:''
        },
        resolver: yupResolver(schema),
    });

    const onsubmit = async (target:any) => {

        let pSK: string = '';
        
        try {

            const confilm = window.confirm("ユーザ登録を行います。\nよろしいですか？");

            if (!confilm) return;

            const rslt1 = await connBackendPost("/format/makeSK");
            pSK = rslt1.KEY;
    
            const strUserNameEnc = encrypt(target.userName, pSK);
            const strPassEnc = encrypt(target.password1, pSK);
            const strMailAddEnd = encrypt(target.mailAddress, pSK);

            const rslt2 = await connBackendPost("/NewAC", {
                userName: strUserNameEnc, email: strMailAddEnd, pass: strPassEnc},
                screenInfo.NEWAC,screenAct.INSERT
            );

            if ( typeof rslt2 !== 'number') {
                throw new Error("型不正発生") ;
            }

            switch (rslt2) {
                case 1:
                    setMsgUserName("すでに登録されているユーザIDです。");
                    setMsgMailAdd("");
                    errMsg();
                    break;
                case 2:
                    setMsgUserName("");
                    setMsgMailAdd("すでに登録されているメールアドレスです。");
                    errMsg();
                    break;
                case 3:
                    setMsgUserName("すでに登録されているユーザIDです。");
                    setMsgMailAdd("すでに登録されているメールアドレスです。");
                    errMsg();
                    break;
                default :
                    alert("新しいアカウントが作成されました。");
                    await connBackendPost("/format/delSK");
                    navigate("/");
                    break;
            }

        } catch(error) {
            console.error(error);
        }
    }    

    const onerror = (err:any) => console.log(err);


    return (
        <>
        <form onSubmit={handleSubmit(onsubmit, onerror)} className="newAC">
            <dl>
                <dt><label htmlFor="userName">ユーザ名</label></dt>
                <dd>
                    <input type="text" id="userName" 
                        {...register('userName')}
                    />
                </dd>
                <dt />
                <dd>
                    <p className="alert">{errors.userName?.message || errMsgUserName}</p>
                </dd>
                <dt><label htmlFor="mailAddress">メールアドレス</label></dt>
                <dd>
                    <input type="text" id="mailAddress" autoComplete="off"
                        {...register('mailAddress')}/>
                </dd>
                <dt />
                <dd>
                    <p className="alert">
                        {errors.mailAddress?.message || errMsgMailAdd}</p>
                </dd>
                <dt><label htmlFor="password1">パスワード</label></dt>
                <dd>
                    <input type="password" id="password1" autoComplete="off"
                        {...register('password1')}/>
                </dd>
                <dt />
                <dd>
                    <p className="alert">
                        {errors.password1?.message}</p>
                </dd>
                <dt><label htmlFor="password2">パスワード(確認)</label></dt>
                <dd>
                    <input type="password" id="password2" autoComplete="off"
                        {...register('password2')}/>
                </dd>
                <dt />
                <dd>
                    <p className="alert">
                        {errors.password2?.message}</p>
                </dd>
            </dl>
            <div className="button-center">
                <button type="submit">登録</button>
            </div>
        </form>
        </>
    );
}