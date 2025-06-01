import CompNewAccount from "../comp/cNewAC"
import CompHeader from "../comp/cHeader"
import CompFooter from '../comp/cFooter';

export default function NewAC() {
    return (
        <>
        <CompHeader strPageName={"Register a new account"} 
                    setBackPage={true} 
                    setTopPage={false}
                    setLogout={false}
                    setUserInfo={false}/>
        <main>
            <div className="title-2">
                <h1> - 新規アカウント登録 - </h1>
            </div>
            <div className="box-1">
                <h3>【新規アカウント登録の際の注意点】</h3>
                <div className="message-1">
                    <p>１．ユーザID,メールアドレス,パスワード,パスワード(確認用)を入力してください。</p>
                    <p>２．ユーザID、メールアドレスは、すでに登録されている場合は、</p>
                    <p>　　新規アカウントとしての登録はできません。</p>
                    <p>３．パスワードは8文字以上、20文字以下で、</p>
                    <p>　　半角英数字、記号「_」「.」「@」「-」のいずれかの文字を設定してください。</p>
                </div>
                <br />
                <CompNewAccount />
            </div>
        </main>
        <CompFooter />
        </>

    );
}