import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import yup from '../../yup/yup.jp';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from "react";
import { connBackendPost } from '../../api/conn';
import { encrypt } from '../../api/crypt';
import { useRecoilValue, useRecoilState } from 'recoil';
import { SecK, userChgFlg,userInfo } from '../../state/atom';
import { screenInfo,screenAct } from '../../state/baseInfo';

const schema = yup.object({
    mailAddress:yup.string().label('メールアドレス')
                    .nullable()
                    .transform((curr, orag) => (orag === "" ? null : curr ))
                    .email(),
    password1: yup.string().label('パスワード')
                    .nullable()
                    .transform((curr, orag) => (orag === "" ? null : curr ))
                    .min(8).max(20).matches(/^[0-9a-zA-Z-@_\\.]+$/,"半角英数字、記号「_」「.」「@」「-」"),
    password2: yup.string().label('パスワード(確認用)')
                    .nullable()
                    .transform((curr, orag) => (orag === "" ? null : curr ))
                    .min(8).max(20)
                    .test('matchPass1',"「パスワード」項目と違う文字列が設定されています",
                        function(value) {
                            if (this.parent.password1 !== value) {
                                return false;
                            }
                            return true;
                        })
});

export default function CompChgEdit() {

    const [errMsgMailAdd, setMsgMailAdd] = useState("");
    const [errMsgPass1, setMsgPass1] = useState("");
    const [errMsgPass2, ] = useState("");
    const pSecK = useRecoilValue(SecK);
    const [pUserChgFlg, setUserChgFlg] = useRecoilState(userChgFlg);
    const [mailAddressBfr, setMailAddressBfr] = useState('');
    const [passwordBfr, setPasswordBfr] = useState('');
    const [pPastCnt, setPPastCnt] = useState('');
    const [,setUserInfo] = useRecoilState(userInfo)

    const navigate = useNavigate();

    const defaultValues = {
        mailAddress:'',
        password1:'',
        password2:''
    }

        //  パスワード変更設定判定
    const [modePassRslt, setModePassRslt] = useState(false)

    const { register, handleSubmit, reset,formState: {errors} } = useForm({
        defaultValues,
        resolver: yupResolver(schema),
    });

    useEffect( () => {

        const initializeData = async () => {
            setModePassRslt(typeof pUserChgFlg === "string" && pUserChgFlg === '1');
            await setValueBfr();  // 非同期処理完了後に再レンダリングを行う
        };

        initializeData();

    },[])

    const setValueBfr  = async () => {

        try{
            const rslt = await connBackendPost('/userChg/Read');

            setMailAddressBfr(rslt.mailAdd.toString());
            setPasswordBfr('*'.repeat(Number(rslt.passLen)));
            setPPastCnt(rslt.pastCnt.toString());
        }  catch  (err) {
            console.log(err)
        }
    }

    const onsubmit = async (target:any) => {

        let confilmTgt = '';
        let chgTgt = '';

        try {
            if (modePassRslt){
                if ( typeof target.password1 === "string" &&
                            target.password1.length === 0 ) {
                    setMsgPass1("パスワードが設定されていません。");
                    return;
                }

                confilmTgt = 'パスワード'
                chgTgt = '1'

            } else {

                if ( ( target.mailAddress == null ) 
                && ( target.password1 == null ))  {
                    setMsgMailAdd("変更する値が設定されていません")
                    setMsgPass1("変更する値が設定されていません");
                    return;
                }

                if (target.mailAddress == null &&
                    target.password1 != null ) {
                    confilmTgt = 'パスワード'
                    chgTgt = '1'
                } else if (target.mailAddress != null &&
                    target.password1 == null ) {
                    confilmTgt = 'メールアドレス'
                    chgTgt = '2'
                } else {
                    confilmTgt = 'ユーザ情報'
                    chgTgt = '9'
                }
            }

            if (!confirm(confilmTgt + 'を変更します。\nよろしいですか？')) return;

            const rslt = await connBackendPost('/userChg/Chg', {
                email  : encrypt(target.mailAddress,pSecK),
                pass : encrypt(target.password1, pSecK),
                mode : chgTgt // Passのみ: 1 , Mailのみ: 2, Pass Mail 両方
            },screenInfo.USERCHG,screenAct.UPDATE)

            switch ( rslt.toString() )
            {
                case '-1' :  // 対象ユーザなし
                    alert("システムエラーが発生しました。\n管理者に連絡してください。");
                    setMsgMailAdd("対象のユーザが設定されていません")
                    setMsgPass1("対象のユーザが設定されていません");
                    break;
                case '1' :  // 現在の設定と同じパスワードが入力された
                    setMsgMailAdd("")
                    setMsgPass1("現在設定されているパスワードと同じです。");
                    break;
                case '2' :  // 過去使用されているパスワード
                    setMsgMailAdd("")
                    setMsgPass1("過去に使用されたパスワードと同じです。");
                    break;
                case '11' : // 現在の設定と同じメールアドレスが入力された
                    setMsgMailAdd("現在設定されているメールアドレスと同じです。")
                    setMsgPass1("");
                    break;
                case '12' : // 他のユーザと同じメールアドレスが入力された
                    setMsgMailAdd("他のユーザが同じメールアドレスを使用しています。")
                    setMsgPass1("");
                    break;
                default :
                    if (modePassRslt) {
                        alert(confilmTgt + "を変更しました。\n ログイン画面に戻ります。");
                        setUserChgFlg('');
                        await connBackendPost("/logout" );
                        setUserInfo({name: ""})
                        navigate("/", {replace:true});
                    } else {
                        alert(confilmTgt + "を変更しました。");
                        setValueBfr();
                        reset(defaultValues);
                        setMsgMailAdd("");
                        setMsgPass1("");
                    }
                    // 
            }

        } catch(error) {
            console.log(error);
        }
    }

    const onerror = (err:any) => console.log(err);

    return (
        <div className="box-1">
            { !modePassRslt ?
                 ( <CompExpdef pastCnt={pPastCnt}/> ) :
                 ( <CompExp1 pastCnt={pPastCnt}/> ) }
        <br/>
        <form onSubmit={handleSubmit(onsubmit, onerror)} className="login">
        <dl>
            { !modePassRslt ? (
                <>
                    <dt><label htmlFor="mailAddress">メールアドレス</label></dt>
                        <dd>
                            <input type="text" id="mailAddress" autoComplete="off"
                                {...register('mailAddress')}/>
                        </dd>
                    <dt />
                    <dd><label>現在の設定 :  {mailAddressBfr || "loading..."}</label>
                    </dd>
                    <dt/>
                    <dd>
                        <p className="alert">
                            {errors.mailAddress?.message || errMsgMailAdd}</p>
                    </dd>
                </>
            ) :  <></>}

            <dt><label htmlFor="password1">パスワード</label></dt>
            <dd>
                <input type="password" id="password1" autoComplete="off"
                    {...register('password1')}/>
            </dd>
            <dt />
            <dd>
                <label>現在の設定 : {passwordBfr || "loading..."}</label>
            </dd>
            <dt />
            <dd>
                <p className="alert">
                    {errors.password1?.message || errMsgPass1 }</p>
            </dd>

            <dt><label htmlFor="password2">パスワード(確認)</label></dt>
            <dd>
                <input type="password" id="password2" autoComplete="off"
                    {...register('password2')}/>
            </dd>
            <dt />
            <dd>
                <p className="alert">
                {errors.password2?.message || errMsgPass2 }</p>
            </dd>
        </dl>
        <div className="button-center">
                <button type="submit">登録</button>
        </div>
        </form>
        </div>
    )
    
}

interface propPastCnt {
    pastCnt : string
}

function CompExp1 (props : propPastCnt) {
    return (
        <>
        <h3>【パスワード再設定に関する注意点】</h3>
            <div className="message-1">
                <p>１．パスワード,パスワード(確認用)を入力してください。</p>
                <p>２．パスワードは8文字以上、20文字以下で、</p>
                <p>　　半角英数字、記号「_」「.」「@」「-」のいずれかの文字を設定してください。</p>
                <p>３．過去、{props.pastCnt}世代前までに使用されたパスワードは設定できません。</p>
            </div>
        </>
    );
}

function CompExpdef (props : propPastCnt) {
    return (
        <>
        <h3>【ユーザ情報設定変更に関する注意点】</h3>
            <div className="message-1">
                <p>１．メールアドレス, または パスワード と パスワード(確認用)を入力してください。</p>
                <p>２．メールアドレスが、他ユーザで既に使われている場合、設定できません。</p>
                <p>３．パスワードは8文字以上、20文字以下で、</p>
                <p>　　半角英数字、記号「_」「.」「@」「-」のいずれかの文字を設定してください。</p>
                <p>４．過去、{props.pastCnt}世代前までに使用されたパスワードは設定できません。</p>
            </div>
        </>
    );
}

