import { connBackendPost } from "./conn";

export interface interfaceLog {
    USERID: string;
    SCRID: string;
    ACTION: string;
    TIME: string;
    STATE: string;
    DETAIL: string;
}


export async function getLog (getCnt: number, orderC: string, classID: number, visible: boolean ):Promise<any> {
    try {
        const rslt = await connBackendPost('/common/log/list',
            {orderC: orderC, classID: classID, visible: visible}, )
    
        if (Array.isArray(rslt)) return rslt.slice(0, getCnt);
        else return []

    } catch (err) {
        console.log(err)
    };
}