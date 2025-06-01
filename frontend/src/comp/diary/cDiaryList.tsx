import { useState, useEffect } from 'react';
import {connBackendPost} from '../../api/conn'
import { useRecoilState,useRecoilValue, } from 'recoil';
import { diaryIndexAtom,diarySearchWordAtom, diaryModalViewAtom } from '../../state/atom'; 

interface Diary {
    DIARYID: number;
    TITLE: string;
    TEXT: string;
    CREATEDATE: string;
    UPDATEDATE: string;
}

export default function CompDiaryList() {

    const [diaryList, setDiaryList] = useState([]);
    const diaryIndex = useRecoilValue(diaryIndexAtom);
    const searchWord = useRecoilValue(diarySearchWordAtom);
    const [modalView, setmodalView] = useRecoilState(diaryModalViewAtom);

    const setDiaryListMain = () => {
        connBackendPost('/diary/list',{ searchWord: searchWord, targetMonth: diaryIndex })
        .then((rslt) => {
            setDiaryList(rslt);
        })
        .catch((err) => console.log(err))
    };

    useEffect(() => {
        setDiaryListMain();
    },[diaryIndex, searchWord, modalView]);

    const updateDiatyBtnClick = ( id: number ) => {
        setmodalView({mode:2, id: id });
    }

    const deleteDiatyBtnClick = ( id: number ) => {
        setmodalView({mode:3, id: id});
    }

    return (
        
        <div className="frame-center-child">

            {diaryList.map((diary: Diary, index) => (
                <div key={index} className="dairy">
                    <div className="dairy-head">
                        <h1 className="dairy-title">
                            {diary.TITLE}
                            <br />
                        </h1>
                        <div className="dairy-head-right">
                            <div className="dairy-head-date">
                                Create:{diary.CREATEDATE} / Update:{diary.UPDATEDATE}
                            </div>
                            <div className="dairy-head-btn">
                                <button className="btn-min1" onClick={() => { updateDiatyBtnClick(diary.DIARYID) }}>Update</button>
                                <button className="btn-min1" onClick={() => { deleteDiatyBtnClick(diary.DIARYID) }}>Delete</button>
                            </div>
                        </div>
                    </div>
                <div className="dairy-bottom">{diary.TEXT}</div>
            </div>
            ))}
            
        </div>
    );
}

