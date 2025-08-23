import { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { diaryIndexAtom, diarySearchWordAtom, diaryModalViewAtom } from '../../state/atom';
import { fetchDiaryList } from '../../services/diaryService';
import { Diary } from '../../types/diary'

export const useDiaryList = () => {
  const [diaryList, setDiaryList] = useState<Diary[]>([]);
  const diaryIndex = useRecoilValue(diaryIndexAtom);
  const searchWord = useRecoilValue(diarySearchWordAtom);
  const [modalView, setModalView] = useRecoilState(diaryModalViewAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiaryList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDiaryList({ searchWord, targetMonth: diaryIndex });
      setDiaryList(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diary list');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (id: number) => {
    setModalView({ mode: 2, id });
  };

  const openDeleteModal = (id: number) => {
    setModalView({ mode: 3, id });
  };

  useEffect(() => {
    loadDiaryList();
  }, [diaryIndex, searchWord, modalView]);

  return {
    diaryList,
    isLoading,
    error,
    openUpdateModal,
    openDeleteModal,
    reload: loadDiaryList
  };
};