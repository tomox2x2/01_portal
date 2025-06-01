import CompHeader from "../comp/cHeader"
import CompFooter from '../comp/cFooter';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { userChgFlg } from "../state/atom";
import CompChgEdit from "../comp/userChg/cUseChgEdit"

export default function UserChg() {

    const [userChgF, ] = useRecoilState(userChgFlg);
    const [userChgTitle,setUserChgTitle] = useState('');
    const [userChgTitleEng,setUserChgTitleEng] = useState('');

    useEffect( () => {

        switch (userChgF) {
            case "1":
                setUserChgTitleEng("Password Change")
                setUserChgTitle("パスワード変更")
                break;
    
            default:
                setUserChgTitleEng("User Info Change")
                setUserChgTitle("ユーザ情報変更")
                break;
        }

    },[userChgF])


    return (
        <>
        <CompHeader strPageName={ userChgTitleEng } 
                    setBackPage={ false } 
                    setLogout={ userChgF === '1' ? false : true }
                    setTopPage={userChgF === '1' ? false : true}
                    setUserInfo={false}/> 
        <main>
            <div className="title-2">
                <h1> - {userChgTitle} - </h1>
            </div>
            <CompChgEdit />
        </main>
        <CompFooter />
        </>

    );
}
