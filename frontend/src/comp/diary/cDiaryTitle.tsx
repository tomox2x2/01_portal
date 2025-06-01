import { useState,useEffect } from 'react'
import { useRecoilState, useRecoilValue, } from 'recoil';
import { diaryIndexAtom,diarySearchWordAtom,diaryModalViewAtom } from '../../state/atom'; 

export default function CompDiaryTitle() {

    const diaryIndex = useRecoilValue(diaryIndexAtom);
    const searchWord = useRecoilValue(diarySearchWordAtom);
    const [, setModalViewFlg ] = useRecoilState(diaryModalViewAtom);
    const [ strTitle, setStrTitle ] = useState('');

    useEffect(() => {
        if ( searchWord ) setStrTitle( "Search Rslt：" + searchWord);
        else setStrTitle(  "-" + diaryIndex + "-");
    },[diaryIndex, searchWord]);

    return (
        <div className="frame-top2">
            <div className="title">
                <h1> {strTitle} </h1>
            </div>
            <button className="btn-middle" onClick={(() => setModalViewFlg({ mode:1, id:0 }))}>Create New</button>
        </div>
    )
}