import { useState,useEffect } from 'react'; 
import { useRecoilState } from 'recoil';
import { diaryModalViewAtom } from '../../state/atom'; 
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../yup/yup.jp';
import { useForm } from 'react-hook-form';
import { connBackendPost } from '../../api/conn';
import { screenInfo, screenAct } from '../../state/baseInfo';

const schema = yup.object({
    title: yup.string().label('Title欄').required(),
    text: yup.string().label('Text欄').required()
});

export default function compDiaryModal() {

    const [ diaryTitle, setDiaryTitle ] = useState('');
    const [ diaryText, setDiaryText ] = useState('');
    const [ diaryModalViewFlg, setdiaryModalViewFlg ] = useRecoilState(diaryModalViewAtom);
    const [ modalTitle, setModalTitle ] = useState('');
    const [ modalSubmitBynLabel, setmodalSubmitBynLabel ] = useState('');
    const [ modalinputDisable, setmodalinputDisable ] = useState(false);
    const values = { title:diaryTitle ,text:diaryText};

    const { register, handleSubmit, reset, formState: {errors} } = useForm({

        defaultValues: {
            title:'',
            text:''
        },
        values,
        resolver: yupResolver(schema),
    });

    const getInit = () => {

        try {
            switch ( diaryModalViewFlg.mode ) {
                case 2 :
                case 3 :
                    connBackendPost('/diary/list',{ id: diaryModalViewFlg.id })
                    .then((rslt) => {
                        setDiaryTitle(rslt[0].TITLE);
                        setDiaryText(rslt[0].TEXT);
                    })
                    .catch((err) => console.log(err))
                    break;
                default :
                    break;
            }
        } catch( error ) {
            console.error(error);
        }

    };
    
    const clearInit = () => {
        setDiaryTitle('');
        setDiaryText('');
    }

    const onsubmit = async (target:any) => {

        switch ( diaryModalViewFlg.mode ) {
            case 1 :
                createDiary(target.title, target.text);
                break;
            case 2 :
                updateDiary(diaryModalViewFlg.id, target.title, target.text);
                break;
            case 3 :
                deleteDiary(diaryModalViewFlg.id, target.title);
                break;
            default :
                break;
        }

    }    

    const createDiary = async ( title: string, text: string) => {

        try {
            if (!confirm('新しく日記を登録します。よろしいですか？')) return;

            await connBackendPost("/diary/create", 
                {title: title, text: text},
                screenInfo.DIARY, screenAct.INSERT);

            alert('新しく日記が登録されました。')
            onreset();
                
        } catch(error) {
            console.error(error);
        }
    };

    const updateDiary = async ( id: number, title: string, text: string) => {

        try {
            if (!confirm('日記を更新します。よろしいですか？')) return;

            await connBackendPost("/diary/update", 
                {diaryId: id, title: title, text: text},
                screenInfo.DIARY, screenAct.UPDATE);

            alert('日記が更新されました。')
            onreset();
                
        } catch(error) {
            console.error(error);
        }
    };

    const deleteDiary = async ( id: number, title: string) => {

        try {
            if (!confirm('日記を削除します。よろしいですか？')) return;

            await connBackendPost("/diary/delete", {diaryId: id, title:title},
                screenInfo.DIARY, screenAct.INSERT);

            alert('日記が削除されました。')
           onreset();
                
        } catch(error) {
            console.error(error);
        }
    };

    useEffect(() => {
        switch ( diaryModalViewFlg.mode ) {
            case 1 :
                setModalTitle("Create New Diary");
                setmodalSubmitBynLabel("Create");
                setmodalinputDisable(false);
                clearInit();
                break;
            case 2 :
                setModalTitle("Update Diary");
                setmodalSubmitBynLabel("Update");
                setmodalinputDisable(false);
                getInit();
                break;
            case 3 :
                setModalTitle("Delete Diary");
                setmodalSubmitBynLabel("Delete");
                setmodalinputDisable(true);
                getInit();
                break;
            default :
                setModalTitle("error");
                setmodalSubmitBynLabel("error");
                setmodalinputDisable(true);
                clearInit();
                break;
        };

    },[diaryModalViewFlg.mode])

    const onreset = () => {
        reset({
            title:'',
            text:''
        }); 
        setdiaryModalViewFlg({mode:0, id:0}); // モーダルを閉じる
    };

    const onerror = (err:any) => console.log(err);

    if( diaryModalViewFlg.mode > 0 ) {

        return (
            <div id="overlay">
                <div id="modalView">
                    <div className="title"><h1>{modalTitle}</h1></div>
                    <form onSubmit={handleSubmit(onsubmit, onerror)}>
                        <dl>
                            <dt>Title:</dt>
                            <dd><input id="title" type="text" autoComplete="off" {...register('title')} disabled={modalinputDisable} /></dd>
                            <dt></dt>
                            <dd className='alert'>{errors.title?.message}</dd>
                            <dt>Text:</dt>
                            <dd><textarea id="text" autoComplete="off" {...register('text')} disabled={modalinputDisable} /></dd>
                            <dt></dt>
                            <dd className='alert'>{errors.text?.message}</dd>
                        </dl>
                        <div className="buttonArea button" >
                            <button type='submit'>{modalSubmitBynLabel}</button>
                            <button onClick={(() => onreset())}>Leave</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    } else {
        return null;
    }

};