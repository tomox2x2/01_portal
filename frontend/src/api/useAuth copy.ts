import { useEffect } from "react";
import { connBackendGet } from "./conn";
import { useRecoilState } from 'recoil';
import { userAuthChecked }from '../state/atom';
import { connBackendPost } from '../api/conn';
import { screenAct  } from "../state/baseInfo";


const checkJwt = async () => {
    return await connBackendGet("/tokenVerification" );
};

export const removeAuth = () =>{

    const handleLogout = async () => {
        await connBackendPost("/logout",{},'',screenAct.LOGOUT );
    };

    const delSK = async () => {
        await connBackendPost("/format/delSK");
    }

    useEffect(()=> {

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        }

        const handleUnload = () => {
            alert('アンロードしました');
            handleLogout();
            delSK();
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    },[]);

    return;
}


export const useAuth = () => {

    //認証を許可するかどうかを状態管理
    const [authChecked, setAuthChecked] = useRecoilState(userAuthChecked);

    const handleCheckJwt = async () => {
        try {
            const response = await checkJwt();
            setAuthChecked({
                checked: true,
                isAuthenticated: response.isAuthenticated 
            });
            
        } catch (error) {

            setAuthChecked({
                checked: true,
                isAuthenticated:false 
            });

        }
    };

    const refreshAuth = async() => {
        await handleCheckJwt();
    }

    //レンダリング後に実行
    useEffect(() => {
        handleCheckJwt();
    }, []);

    return { ...authChecked, refreshAuth };
};

