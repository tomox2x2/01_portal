import { useState, useEffect } from 'react'; 
import { useRecoilState } from 'recoil';
import { todoCategoruItemAtom, todoModalViewAtom, todoSearchWordAtom } from '../../state/atom'; 
import { connBackendPost } from '../../api/conn'

interface todoCategoryList {
    CATEGORY: string;
}

export default function CompTodoCategory() {

    const [ , setTodoCategoryItem ] = useRecoilState( todoCategoruItemAtom );
    const [ , setSearchWord] = useRecoilState(todoSearchWordAtom);
    const [ todoCategoryList, setTodoCategoryList ] = useState([])
    const [ modalViewFlg ] = useRecoilState(todoModalViewAtom);

    useEffect(() => {
        setTodoCategory();
        setSearchWord('');
    },[modalViewFlg]);

    const setTodoCategory = () => {
        connBackendPost('/todo/category',{})
        .then((rslt) => {
            setTodoCategoryList(rslt);
            setTodoCategoryItem('');
        })
        .catch((err) => console.log(err))

    }

    const setTodoCategoryMain =( strCategory: string ) =>{
        setTodoCategoryItem(strCategory);
    };

    return (
        <div className="box-secound">
        <div className="box-secound-top">
            <h2>Category</h2>
            <button onClick={(() => setTodoCategoryMain('') )}>NonSelected</button>
        </div>
        <ul className="category-list">
            { todoCategoryList.map((item : todoCategoryList, index) => (
                <li>
                {" "}
                - <button key={index} onClick={(() => setTodoCategoryMain(item.CATEGORY) )}>{ item.CATEGORY }</button>
                </li>
            ))}

        </ul>
        </div>
    );
};