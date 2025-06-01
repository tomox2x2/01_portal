import { /*useEffect,*/ useState } from 'react';
import { useRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../yup/yup.jp';
import { encrypt } from '../../api/crypt';
import { useNavigate } from 'react-router-dom';
import { connBackendPost } from '../../api/conn';
import { SecK,userChgFlg,userInfo } from '../../state/atom'; 
import { useAuth } from '../../api/useAuth';
import { screenInfo,screenAct } from '../../state/baseInfo';

const schema = yup.object({
    userName: yup.string().label('ユーザ名').required(),
    password: yup.string().label('パスワード').required()
});

export default function CompLogin() {

    const [, setSK] = useRecoilState( SecK );
    const [, setUserChgFlg] = useRecoilState( userChgFlg );
    const [, setUserInfo] = useRecoilState( userInfo );
    
    const [errMsgUserName, setMsgUserName] = useState("");
    const [errMsgPass, setMsgPass] = useState("");

    const navigate = useNavigate();
    const { refreshAuth } = useAuth();

    const { register, handleSubmit, formState: {errors} } = useForm({
        defaultValues: {
            userName:'',
            password:''
        },
        resolver: yupResolver(schema),
    });

    const onsubmit = async (target:any) => {

        let pSK: string = '';

        try {
            const rslt = await connBackendPost("/format/makeSK");
            setSK(rslt.KEY);
            pSK = rslt.KEY;

        } catch(error) {
            console.error(error);
        } 
        
        const strUserNameEnc = encrypt(target.userName, pSK);
        const strPassEnc = encrypt(target.password, pSK);

        try {
            const rslt = await connBackendPost("/chkLogin", {userName: strUserNameEnc, pass: strPassEnc},
                screenInfo.LOGIN,screenAct.LOGIN);

            if ( typeof rslt !== 'number') {
                throw new Error("型不正発生") ;
            }

            switch (rslt) {
                case 1:
                    setMsgUserName("ユーザIDに誤りがあります。");
                    setMsgPass("");
                    break;
                case 2:
                    setMsgUserName("");
                    setMsgPass("パスワードに誤りがあります。");
                    break;
                case 3:
                    // ログイン失敗 かつ 失敗回数超過
                    setMsgUserName("");
                    setMsgPass("ログイン失敗階数が上限を超えました。");
                    alert('ログイン失敗回数が上限を超えました。\nパスワードリセットを行ってください。')
                    break;
                case 4:
                    // ログイン成功(ただし、パスワード変更要求)
                    setMsgUserName("");
                    setMsgPass("");
                    alert('パスワードの有効期限が切れました。\nパスワードを再設定してください。')
                    setUserChgFlg("1");  // ユーザ変更フラグ：１(パスワード変更)
                    navigate("/userChg") 
                    break;
                case 5:
                    // ログイン成功(ただし、仮パスワードでのログインのため、パスワード変更要求)
                    setMsgUserName("");
                    setMsgPass("");
                    alert('仮パスワードでのログインです。\nパスワードを再設定してください。')
                    setUserChgFlg("1");  // ユーザ変更フラグ：１(パスワード変更)
                    await refreshAuth();
                    navigate("/userChg") 
                    break;
                default :
                    // ログイン成功
                    setUserInfo({name: target.userName}) // ユーザ名設定
                    setMsgUserName("");
                    setMsgPass("");
                    await refreshAuth();
                    await connBackendPost("/Words/Set");
                    navigate("/portal");
                    break;
            }

        } catch(error) {
            console.error(error);
        } 
    }    

    const onerror = (err:any) => console.log(err);

    return (
            <>
            <form onSubmit={handleSubmit(onsubmit, onerror)} className="login">
                <dl>
                <dt><label htmlFor="userName">ユーザ名</label></dt>
                <dd>
                    <input id="userName" type="text" autoComplete="off"
                        {...register('userName')}
                    />
                </dd>
                <dt />
                <dd>
                    <p className="alert">
                        {errors.userName?.message || errMsgUserName}
                    </p>
                </dd>
                <dt><label htmlFor="password">パスワード</label></dt>
                <dd>
                    <input id="password" type="password" autoComplete="off"

                        {...register('password')}
                    />
                </dd>
                <dt />
                <dd>
                    <p className="alert">
                        {errors.password?.message || errMsgPass}
                    </p>
                </dd>
                </dl>
                <div className="button-center">
                    <button type="submit">ログイン</button>
                </div>
            </form>
            </>
    );
}