import axios from 'axios'; 

// 環境変数から設定
const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.toString() : 'http://localhost:3001';
const timeout = import.meta.env.VITE_TIMEOUT ? parseInt(import.meta.env.VITE_TIMEOUT, 10) : 10000;

export function connBackendPost(conPath:string, reqData?: object, ScreenID?: string, Action?: string) {

    reqData = {...reqData, ScreenID:ScreenID, ACT:Action};

    return axios.post(baseURL + conPath, reqData, { withCredentials: true, timeout })
    .then(res => res.data)
    .catch(err => { throw err; });

}

export function connBackendGet(conPath:string, reqData?: object, ScreenID?: string, Action?: string) {

    reqData = {...reqData, ScreenID:ScreenID, ACT:Action};

    return axios.get(baseURL + conPath, { data: reqData, withCredentials: true, timeout })
    .then(res => res.data)
    .catch(err => { throw err; });
}
