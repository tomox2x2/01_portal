import logoImage from "../image/Daily_1.png";
import CompHeader from '../comp/CompHeader';
import CompLogin from "../comp/login/CompLogin"
import CompSignUp from '../comp/login/CompSignUp';
import CompFooter from '../comp/CompFooter';
import CompPassResetBtn from "../comp/login/CompPassResetBtn";

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