import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../yup/yup.jp';
import { useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { diarySearchWordAtom } from '../../state/atom'; 

const schema = yup.object({
    searchWord: yup.string().label('検索項目').allowAlphaNumJapan()
});

export default function CompDiarySearch() {

    const [ inputValue, setInputValue ] = useState('')
    const [ searchWord, setSearchWord] = useRecoilState(diarySearchWordAtom);

    const { register, handleSubmit, formState: {errors} } = useForm({
        defaultValues: {
            searchWord: ''
        },
        resolver: yupResolver(schema),
    });

    const onsubmit = async (target: any) => {
        setSearchWord(target.searchWord);
    }

    const onerror = (err:any) => console.log(err);

    useEffect (() => {
        if( searchWord == "") {
            setInputValue("");
        }
    },[searchWord]);

    return (
        <div className="box-first">
            <h2>Search</h2>
            <form onSubmit={handleSubmit(onsubmit, onerror)} className="diarySearch" >
                <input 
                    id="searchWord" 
                    type="text"
                    value={inputValue}
                    autoComplete="off" 
                    {...register('searchWord')} 
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }} 
                    />
                <div className="right">
                    <button className="btn-min1">search</button>
                </div>
                <p className="alert">
                        {errors.searchWord?.message}
                </p>
            </form>
        </div>
    );
}