import logoImage from "../image/Daily_1.png";
import CompHeader from '../comp/cHeader';
import CompLogin from "../comp/login/cLogin"
import CompSignUp from '../comp/login/cSignUp';
import CompFooter from '../comp/cFooter';
import CompPassResetBtn from "../comp/login/cPassResetBtn";

export default function Login() {
    return (
        <>
        <CompHeader strPageName={"login"} 
                    setBackPage={false} 
                    setLogout={false}
                    setTopPage={false}
                    setUserInfo={false}/>
        <main>
            <div className="title-1">
            <img src={logoImage} alt="logo" />
            </div>
            <div className="title-2">
            <h1> - 日課ツールポータル - </h1>
            </div>
            <div className="box-2">
                <CompLogin />
                <CompPassResetBtn/>
            </div>
            <div className="box-2">
                <CompSignUp />
            </div>
        </main>
        <CompFooter />
        </>
    );
}