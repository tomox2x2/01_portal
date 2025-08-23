import { useState,useEffect } from 'react'
import { useRecoilState, useRecoilValue, } from 'recoil';
import { todoModalViewAtom, todoCategoruItemAtom, todoSearchWordAtom, todoModalViewDaySetAtom } from '../../state/atom'; 

export default function CompTodoTitle() {

    const todoCategory = useRecoilValue(todoCategoruItemAtom);
    const searchWord = useRecoilValue(todoSearchWordAtom);
    const [, setModalViewFlg ] = useRecoilState(todoModalViewAtom);
    const [, setDaySetModalViewFlg ] = useRecoilState(todoModalViewDaySetAtom);
    const [ strTitle, setStrTitle ] = useState('');

    useEffect(() => {
        
        let title: string = '';
        if ( searchWord || todoCategory ) {
            if ( searchWord )   title += "Search Rslt：" + searchWord;
            if ( todoCategory ) { 
                if ( title ) title += ' / '
                title += "Category：" + todoCategory; 
            }
        } else { title = 'All' }

        setStrTitle( title );

    },[todoCategory, searchWord]);

    const createTodoList = () => {
        setDaySetModalViewFlg({mode:1});
    };

    return (
    <div className="frame-top2">
        <div className="title">
            <h1>{strTitle}</h1>
        </div>
        <button className="btn-middle" onClick={(() => createTodoList())}>TodoList Update</button>
        <button className="btn-middle" onClick={(() => setModalViewFlg({ mode:1, id:0 }))}>Create New</button>
    </div>
    );
};
