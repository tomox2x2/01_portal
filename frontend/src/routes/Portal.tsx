import logoImage from "../image/Daily_1_transparent.png";
import CompHeader from '../comp/cHeader';
import CompWord from '../comp/cWord';
import CompFooter from '../comp/cFooter';
import CompTodoListPortal from '../comp/todo/cTodoListPortal'
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { getLog, interfaceLog } from "../api/common";
import { useState } from "react";

export default function Portal() {

    const [logInfo, setLogInfo] = useState([])

    const navigate = useNavigate();

    const subGetLog = async () => {
        const sublogInfo = await getLog(7,'2',2, false)
        setLogInfo(sublogInfo);
    }

    useEffect ( () => {
        subGetLog();
    },[navigate])

    return (
        <>
        <CompHeader strPageName={"Top Page"} 
                    setBackPage={true} 
                    setLogout={true}
                    setTopPage={false}
                    setUserInfo={true}/>
        <main className="frame">
            <div className="frame-side">
                <h1>Menu</h1>
                <ul className="menu">
                <li>
                    <button onClick = {() =>  navigate("/diary")}>Diary</button>
                </li>
                <li>
                    <button onClick = {() =>  navigate("/todoEdit")}>Todo Edit</button>
                </li>
                </ul>
            </div>
                <div className="frame-center">
                    <div className="title-1">
                        <img src={logoImage} alt="logo" />
                    </div>
                    <div className="word">
                        <CompWord />
                    </div>
                    <div className="word2">
                        <h2 className='title'>Change log</h2>
                        <div className="History" >
                        <dl>
                            { Array.isArray(logInfo)  ?
                                logInfo.map((logInfoRow:interfaceLog) =>(
                                    <><dt>{logInfoRow.TIME}</dt> <dd>{logInfoRow.DETAIL}</dd></>
                                ))
                                : <></>
                            }
                        </dl>
                        </div>
                    </div>
                </div>
                <div className="frame-side">
                    <CompTodoListPortal/>
                </div>
                </main>
        <CompFooter />
        </>
    );
}