import { useState, useEffect } from 'react';
import { connBackendPost } from '../../api/conn'
import { useRecoilState } from 'recoil';
import { diaryIndexAtom, diarySearchWordAtom,diaryModalViewAtom } from '../../state/atom'; 

interface diaryIndexList {
    CREATEMONTH: string;
}

export default function CompDiaryIndex() {

    const [ , setDiaryIndex ] = useRecoilState(diaryIndexAtom);
    const [ , setSearchWord ] = useRecoilState(diarySearchWordAtom);
    const [ diaryIndexList, setDiaryIndexList] = useState([]);
    const [modalView, ] = useRecoilState(diaryModalViewAtom);

    const setDiaryListMain = () => {
        connBackendPost('/diary/index')
        .then((rslt) => {
            setDiaryIndexList(rslt);
            setDiaryIndex(rslt[0].CREATEMONTH);
            setSearchWord('');
        })
        .catch((err) => console.log(err))
    };

    useEffect(() => {
        setDiaryListMain();
    },[modalView]);

    const setDiaryIndexMain = ( createMonth: string) => {
        setDiaryIndex(createMonth);
        setSearchWord('');
    }

    return (
        <div className="box-secound">
            <h2>Index</h2>
            <ul className="index-month">
            { diaryIndexList.map((item: diaryIndexList, index) => (
                <li><button key={index} onClick={(() => setDiaryIndexMain(item.CREATEMONTH) )}> {item.CREATEMONTH} </button></li>
            ))}
            </ul>
        </div>
    );
}