import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { todoModalViewAtom,todoCategoruItemAtom, todoSearchWordAtom } from '../../state/atom'; 
import { connBackendPost} from '../../api/conn'
import { optionMonth, optionWeek,optionWeekDay,optionDay,todoBase,todoDetail } from './cTodoOption';
import ableImage from '../../image/able.png';
import disableImage from '../../image/disable.png';

export default function CompTodoList() {

    const [todoListBase, setTodoListBase] = useState([]);
    const [todoListDetail, setTodoListDetail] = useState([]);
    const [todoCategoryItem ] = useRecoilState( todoCategoruItemAtom );
    const [todoSearchWord ] = useRecoilState( todoSearchWordAtom );
    const [modalViewFlg, setModalViewFlg ] = useRecoilState(todoModalViewAtom);

    const setDiaryListMain = () => {
        connBackendPost('/todo/list/base', 
            {
                searchWord: todoSearchWord,
                targetCategory: todoCategoryItem
            }
        )
        .then((rslt) => {
            setTodoListBase(rslt);
        })
        .catch((err) => console.log(err))

        connBackendPost('/todo/list/detail',
            {
                searchWord: todoSearchWord,
                targetCategory: todoCategoryItem
            }
        )
        .then((rslt) => {
            setTodoListDetail(rslt);
        })
        .catch((err) => console.log(err))

    };

    useEffect(() => {
        setDiaryListMain();
    },[modalViewFlg, todoSearchWord, todoCategoryItem]);


    return (
        <div className="table-wrap">
            <table className="table-todo">
                <thead>
                <tr className="table-header">
                    <th className="col1">able</th>
                    <th className="col2">Title</th>
                    <th className="col3">Detail</th>
                    <th className="col4">Interval</th>
                    <th className="col5">Alert</th>
                </tr>
                </thead>
                <tbody>
                { todoListBase.map((todoBase : todoBase) => (
                    <tr className="table-row" onDoubleClick={(() => setModalViewFlg({ mode:2, id:todoBase.TODOID }))}>
                        <td className="col1-r">
                            { todoBase.ABLE === 1 ? <img src={ableImage}/> : <img src={disableImage}/> }
                        </td>
                        <td className="col2-r">{makeTodoTitle(todoBase)}</td>
                        <td className="col3-r">{todoBase.DETAIL}</td>
                        <td className="col4-r">
                            { makeTodoDetail(todoListDetail.filter((todoDetail : todoDetail) => todoDetail.TODOID === todoBase.TODOID)) }
                        </td>
                        <td className="col5-r">{todoBase.ALERTDAYS}日前</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function makeTodoTitle( todoBase : todoBase) : string {

    let returnString = '';
    
    if (!todoBase) return '';

    if (todoBase.CATEGORY) returnString += 'Category:' + todoBase.CATEGORY + ' / ';
    if (todoBase.PRIORITY) returnString += 'Priority:'  + todoBase.PRIORITY ;

    if (returnString != '') returnString = '[ ' + returnString + ' ] \n'

    if (todoBase.TITLE) returnString += todoBase.TITLE;

    return returnString;
}


function makeTodoDetail( todoDetail : todoDetail[]) : string{

    let returnString: string = ''
    let tmpStr1: string | undefined = '';
    let tmpStr2: string | undefined = '';
    let tmpStr3: string | undefined = '';
    let tmpStrAry1: string[] = [];
    let tmpStrAry2: string[] = [];
    let tmpStrAry3: string[] = [];

    if( todoDetail.length == 0 ) return '';

    switch ( todoDetail[0].FREQTYPE ) {
        case 1 :
            returnString += '[ Day ] \n';

            todoDetail.forEach((t) => {
                const date = new Date(t.TDATE);
                returnString += date.getFullYear().toString() + '.' +
                              + date.getMonth().toString() + '.' +
                              + date.getDate().toString() +',' ;
            });
            returnString = returnString.substring(0, returnString.length -1);

            break;
        case 2 :
            returnString += '[ Week ] \n';

            todoDetail.forEach((t) => {
                returnString += optionWeekDay.find((v) => v.value == t.TWEEKDAY.toString())?.label + ',';
            });
            returnString = returnString.substring(0, returnString.length -1);
 
            break;
        case 3 :
            returnString += '[ Month(per Day) ] \nMonth:';

            todoDetail.forEach((t) => {
                tmpStr1 = optionMonth.find((v) => v.value == t.TMONTH.toString())?.label;
                if( typeof(tmpStr1) === 'string' && !tmpStrAry1.includes(tmpStr1))  tmpStrAry1.push(tmpStr1);

                tmpStr2 = optionDay.find((v) => v.value == t.TDAY.toString())?.label;
                if( typeof(tmpStr2) === 'string' && !tmpStrAry2.includes(tmpStr2))  tmpStrAry2.push(tmpStr2);
            });
            
            tmpStrAry1.forEach((t) => {
                returnString += t + ',';
            })
            returnString = returnString.substring(0, returnString.length -1) + '\nDay:' ;

            tmpStrAry2.forEach((t) => {
                returnString += t + ',';
            })
            returnString = returnString.substring(0, returnString.length -1);
            break;

        case 4 :
            returnString += '[ Month(per Weekday) ] \nMonth:';

            todoDetail.forEach((t) => {
                tmpStr1 = optionMonth.find((v) => v.value == t.TMONTH.toString())?.label;
                if( typeof(tmpStr1) === 'string' && !tmpStrAry1.includes(tmpStr1))  tmpStrAry1.push(tmpStr1);

                tmpStr2 = optionWeek.find((v) => v.value == t.TWEEK.toString())?.label;
                if( typeof(tmpStr2) === 'string' && !tmpStrAry2.includes(tmpStr2))  tmpStrAry2.push(tmpStr2);

                tmpStr3 = optionWeekDay.find((v) => v.value == t.TWEEKDAY.toString())?.label;
                if( typeof(tmpStr3) === 'string' && !tmpStrAry3.includes(tmpStr3))  tmpStrAry3.push(tmpStr3);
            });
            
            tmpStrAry1.forEach((t) => {
                returnString += t + ',';
            })
            returnString = returnString.substring(0, returnString.length -1) + '\nWeek:' ;

            tmpStrAry2.forEach((t) => {
                returnString += t + ',';
            })
            returnString = returnString.substring(0, returnString.length -1) + '\nWD:' ;

            tmpStrAry3.forEach((t) => {
                returnString += t + ',';
            })
            returnString = returnString.substring(0, returnString.length -1)  ;
            break;
        default :
            returnString += '-';
            break;
        };
 
    return returnString;
}