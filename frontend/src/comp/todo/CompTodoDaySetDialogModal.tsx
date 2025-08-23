import { useState,useEffect } from 'react'; 
import { useRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { todoModalViewDaySetAtom } from '../../state/atom'; 
import yup from '../../yup/yup.jp';
import { yupResolver } from '@hookform/resolvers/yup';
import { connBackendPost } from '../../api/conn';
import { screenInfo, screenAct } from '../../state/baseInfo';


const today = new Date();
const strTodayDate = today.getFullYear().toString() + '-' +
                     ( '0' + ( today.getMonth() + 1 ).toString()).slice(-2) + '-' +
                     ( '0' + today.getDate().toString()).slice(-2);

const checkDate = yup
    .string()
    .test(
        'createDateCheck',
        `本日以降の日付を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: string | undefined | null ) {
            if (typeof(tCheckTarget) == 'string') {
                let inputDate = new Date(tCheckTarget);
                let targetDate = new Date(strTodayDate);

                if ( targetDate <= inputDate ) return true;
                else return false;
            } else { return false; }
        }
    );

const schema = yup.object({
    createDate: checkDate.label('Creation start date')
});
    

export default function CompTodoDaySetDialogModal() {

    const [todoCreateDate, setTodoCreateDate] = useState('');
    const [daySetModalViewFlg, setDaySetModalViewFlg ] = useRecoilState(todoModalViewDaySetAtom);

    const defaultValues = {
        createDate:''
    }
    const values = {
        createDate:todoCreateDate
    }

    const { register, handleSubmit, reset, formState: {errors} } = useForm({
        defaultValues,
        values,
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        switch ( daySetModalViewFlg.mode ) {
            case 1 :
                setTodoCreateDate(strTodayDate);
                break;
            default :
                break;
        };

    },[daySetModalViewFlg.mode])


    const onsubmit = async (target:any) => {

        try {
            if (!confirm(`${target.createDate} 以降の TodoList を作成します。\nよろしいですか？`)) return;

            connBackendPost('/todo/list/create', 
                {createDate: target.createDate},
                screenInfo.TODO, screenAct.REFRESH);

            alert('TodoList が作成されました。')
            onreset();
                
        } catch(error) {
            console.error(error);
        }

    }    

    const onerror = (err:any) => console.log(err);

    const onreset = () => {
        reset({
            createDate: strTodayDate
        }); 
        setDaySetModalViewFlg({mode:0});
    }

    if ( daySetModalViewFlg.mode === 1 ) {
        return (
            <div id="overlay">
                <div id="modalView_mini">
                    <div className='title'>TodoList 作成実行</div>
                    <form onSubmit={handleSubmit(onsubmit, onerror)}>
                        Creation start date： 
                        <input className='input-date' id="createDate" type="date" autoComplete="off" {...register('createDate')} />
                        <dd className="alert">
                            {errors.createDate?.message}
                        </dd>
                        <div>
                            <button onClick={(()=> onreset())}>return</button>
                            <button type='submit'>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}