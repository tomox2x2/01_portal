import { useForm } from 'react-hook-form';
import yup from '../../yup/yup.jp';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from "react";
import { connBackendPost } from '../../api/conn';
import { encrypt } from '../../api/crypt';
import { useRecoilState } from 'recoil';
import { passResetDoneFlg } from '../../state/atom';
import { screenInfo, screenAct } from '../../state/baseInfo';

const schema = yup.object({
    userID:yup.string().label('ユーザID')
                    .required(),
    mailAddress:yup.string().label('メールアドレス')
                    .required()
                    .email()
});

export default function CompPassResetEdit() {

    const [errMsgUserID, setMsgUserID] = useState("");
    const [errMsgMailAdd, setMsgMailAdd] = useState("");
    const [passResetDoneF, setPassResetDoneF] = useRecoilState(passResetDoneFlg);

    const navigate = useNavigate();

    const defaultValues = {
        userID:'',
        mailAddress:''
    }

    const { register, handleSubmit, reset,formState: {errors} } = useForm({
        defaultValues,
        resolver: yupResolver(schema),
    });

    useEffect( () => {
        setPassResetDoneF(false);

    },[navigate])

    const onsubmit = async (target:any) => {

        let pSK: string = '';

        try {

            if (!confirm('パスワードリセットを実行します。\nよろしいですか？')) return;

            const rslt1 = await connBackendPost("/format/makeSK");
            pSK = rslt1.KEY;

            const rslt = await connBackendPost('/userChg/Reset', {
                userName : encrypt(target.userID,pSK),
                email  : encrypt(target.mailAddress,pSK),
            }, screenInfo.PASSRESET, screenAct.DONE)

            switch ( rslt.toString() )
            {
                case '1' :  // 対象のユーザがない。
                    setMsgUserID("対象のユーザが見つかりません。")
                    setMsgMailAdd("")
                    break;
                case '2' :  // 対象のユーザはあるが、メールアドレスが間違っている。
                    setMsgUserID("")
                    setMsgMailAdd("メールアドレスに誤りがあります。")
                    break;
                default :
                    alert("パスワードリセットを実行しました。\n" + 
                          "ログイン画面に戻って、メールに記載されている仮パスワードで\n" + 
                          "ログインしてください。"
                    );
                    setPassResetDoneF(true);
                    await connBackendPost("/format/delSK");
                    reset(defaultValues);
                    setMsgUserID("");
                    setMsgMailAdd("");
            }

        } catch(error) {
            console.log(error);
        }
    }

    const onerror = (err:any) => console.log(err);

    return (
        <div className="box-1">
        <br/>
        { !passResetDoneF ?
                 ( 
                    <>
                    <h3>【パスワードリセットの手順】</h3>
                    <div className="message-1">
                        <p>１．下記の項目に入力して、リセットボタンをクリックしてください。</p>
                        <p>２．入力内容に問題なければ、メールアドレスに仮パスワードが記載されたメールが</p>
                        <p>　　送信されますので、仮パスワードでログイン画面からログインしてください。</p>
                        <p>３．仮パスワードでログインすると、パスワード変更画面が表示されますので、</p>
                        <p>　　新しいパスワードを入力してください。</p>
                        <p/>
                        <p>　　上記の手順を実行すると、新しいパスワードでログインできるようになります。</p>
                    </div>
                    <form onSubmit={handleSubmit(onsubmit, onerror)} className="login">
                    <dl>
                        <dt><label htmlFor="userID">ユーザID</label></dt>
                            <dd>
                                <input type="text" id="userID" autoComplete="off"
                                    {...register('userID')}/>
                            </dd>
                        <dt />
                        <dd>
                            <p className="alert">
                                {errors.userID?.message || errMsgUserID}</p>
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
                    </dl>
                    <div className="button-center">
                            <button type="submit">パスワードリセット</button>
                    </div>
                    </form>
                    </>
                 ) :
                 (
                    <>
                    <h3>【仮パスワード送信】</h3>
                    <div className='login'>
                    <div className="message-1">
                        <p>仮パスワードを指定のメールアドレスに送信しました。</p>
                        <p>受信したメールを確認してください。</p>
                        <p>受信されない場合は、システム管理者に確認してください。</p>
                        </div>
                        <br/>
                        <div className="button-center">
                            <button onClick={() => navigate('/')}> ログイン画面へ </button>
                        </div>
                    </div>
                    </>
                 ) }
        </div>
    )
    
}

