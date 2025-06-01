import { connBackendPost } from '../api/conn';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import { userInfo } from '../state/atom';
import { screenAct } from '../state/baseInfo';

interface propsType {
    strPageName: string;
    setUserInfo: boolean;
    setBackPage: boolean;
    setTopPage: boolean;
    setLogout: boolean;
}

export default function CompHeader( props : propsType) {

    const pUserInfo = useRecoilValue(userInfo)

    const strLinkUserInfo = () => {
        if (props.setUserInfo) {
            return <CompUserInfo />
        }
    }

    const strLinkLogout = () => {
        if (props.setLogout) {
            return <CompLinkLogout />
        }

    }

    const strLinkBackPage = () => {

        if (props.setBackPage ) {
            return <CompLinkBackPage />
        } return;
    };

    const strLinkTopPage = () => {

        if (props.setTopPage ) {
            return <CompLinkTopPage />
        } return;
    };

    return (
        <header>
            <h2>Daily Portal - {props.strPageName}</h2>
            <div className='headerLinkBox'>
            { pUserInfo.name !=="" ? 
                    (<h3>Hello, {pUserInfo.name} </h3>) : null }
                {strLinkUserInfo()}
                {strLinkLogout()}
                {strLinkBackPage()}
                {strLinkTopPage()}
            </div>
        </header>
    );

}

function CompUserInfo () {

    const navigate = useNavigate();

    const handUserInfoChg = async () => {

        navigate("/userChg", {replace: true});
    };

    return (
        <>
        <button onClick={() => handUserInfoChg()}> UI Change </button>
        </>
    )
}

function CompLinkLogout (  ) {

    const [,setUserInfo] = useRecoilState(userInfo)

    const navigate = useNavigate();

    const handleLogout = async () => {

        if (!confirm('ログアウトします。よろしいですか？')) return;
        await connBackendPost("/logout",{},'',screenAct.LOGOUT );
        setUserInfo({name: ""})
        navigate("/", {replace: true});
    };

    return (
        <button onClick={() => handleLogout()}> Log out </button>
    )
}

function CompLinkBackPage () {

    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)}> Back </button>
    )
}

function CompLinkTopPage () {

    const navigate = useNavigate();

    return (
        <button onClick={() => navigate("/portal")}> Back </button>
    )
}

