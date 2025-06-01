import CompHeader from "../comp/cHeader"
import CompFooter from '../comp/cFooter';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { passResetDoneFlg } from "../state/atom";
import CompPassResetEdit from "../comp/userChg/cPassResetEdit"

export default function PassReset() {

    const [passReseDoneF, ] = useRecoilState(passResetDoneFlg);
    const [passResetTitle,setPassResetTitle] = useState('');
    const [passResetTitleEng,setPassResetTitleEng] = useState('');

    useEffect( () => {

        if (passReseDoneF) {
            setPassResetTitleEng("Password Reset Done")
            setPassResetTitle("パスワードリセット 実行")
        } else {
            setPassResetTitleEng("Password Reset")
            setPassResetTitle("パスワードリセット")
        }

    },[passReseDoneF])

    return (
        <>
        <CompHeader strPageName={passResetTitleEng} 
                    setBackPage={ true } 
                    setTopPage={false}
                    setLogout={ false }
                    setUserInfo={ false }/> 
        <main>
            <div className="title-2">
                <h1> - {passResetTitle} - </h1>
            </div>
            <CompPassResetEdit />
        </main>
        <CompFooter />
        </>

    );
}
