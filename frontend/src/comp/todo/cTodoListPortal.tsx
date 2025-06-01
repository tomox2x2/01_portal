import { useState,useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { todoModalViewDaySetAtom } from '../..//state/atom'; 
import CompTodoDaySetDialogModal  from './cTodoDaySetDialogModal'
import { connBackendPost} from '../../api/conn'
import { todoListItem } from './cTodoOption'

const todoListPriorityAry: string[] = [ 'A','B' ];

export default function CompTodoListPortal() {

    const [ todoListItem, setTodoListItem ] = useState([]);
    const [, setDaySetModalViewFlg ] = useRecoilState(todoModalViewDaySetAtom);

    const setTodoListPortalMain = () => {

        setTodoListItem([]);

        const strDateToday: string = new Date().toLocaleDateString();

            connBackendPost('/todo/list/item', 
                {
                    targetPriority: todoListPriorityAry,
                    targetDate: strDateToday
                }
            )
            .then((rslt) => {
                setTodoListItem(rslt);
            })
            .catch((err) => console.log(err))
    };

    useEffect(() => {
        setTodoListPortalMain();
    },[]);

    const createTodoList = () => {
        setDaySetModalViewFlg({mode:1});
    };

    return (
            <>
            <div className="Todo">
                <h1>Todo</h1>
                {todoListPriorityAry.map( (e) => (
                    <div key={e}>
                    <h2>Priority: {e}</h2>
                    <CompTodoListItemDetail itemList={todoListItem} strPriority={e} />
                    </div>
                ))}
            </div>

            <div className="Todo-foot">
                <button onClick={() => {createTodoList()}}>Update</button>
                <button>Print</button>
            </div>
            <CompTodoDaySetDialogModal />
            </>
      );

    function CompTodoListItemDetail ( props:{itemList: any[], strPriority: string }) {

        const targetItemList: todoListItem[] = props.itemList.filter((e: todoListItem) => e.PRIORITY == props.strPriority )
        return (
            <> 
                {targetItemList.map((e) => 
                    <li
                    key={e.TODOID}
                    onClick={(v) => console.log(v.button) } 
                    value={e.TODOID}
                    
                    >{e.TITLE}</li>
                )}
            </>
        );
    };

}

