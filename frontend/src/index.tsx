import React from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./routes/Login";
import Portal from "./routes/Portal";
import NewAC from "./routes/NewAC";
import Diary from "./routes/Diary";
import TodoEdit from "./routes/TodoEdit";
import UserChg from "./routes/UserChg";
import PassReset from "./routes/PassReset";
import { RecoilRoot } from "recoil";
import { PublicRoute, PrivateRoute } from "./AuthRouter";
import './css/style.scss';

const App : React.FC = () => {

    return(
            <RecoilRoot>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<PublicRoute children={<Login />}></PublicRoute>} />
                        <Route path="/newAC" element={<PublicRoute children={<NewAC />}></PublicRoute>} />
                        <Route path="/passReset" element={<PublicRoute children={<PassReset />}></PublicRoute>} />
                        <Route path="/portal" element={<PrivateRoute children={<Portal />}></PrivateRoute>}/>
                        <Route path="/diary" element={<PrivateRoute children={<Diary />}></PrivateRoute>}/>
                        <Route path="/todoEdit" element={<PrivateRoute children={<TodoEdit />}></PrivateRoute>}/>
                        <Route path="/userChg" element={<PrivateRoute children={<UserChg />}></PrivateRoute>}/>
                    </Routes>
                </BrowserRouter>
            </RecoilRoot>
    )
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
