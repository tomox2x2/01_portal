import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { diarySearchWordAtom } from '../../state/atom';
import { diarySearchSchema, DiarySearchData } from '../../validation/diary';

export const useDiarySearch = () => {
  const [searchWord, setSearchWord] = useRecoilState(diarySearchWordAtom);
  const [inputValue, setInputValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<DiarySearchData>({
    defaultValues: { searchWord: '' },
    resolver: yupResolver(diarySearchSchema),
  });

  const onSubmit = (data: DiarySearchData) => {
    setSearchWord(data.searchWord);
  };

  useEffect(() => {
    if (searchWord === "") {
      setInputValue("");
    }
  }, [searchWord]);

  return {
    inputValue,
    setInputValue,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors
  };
};
