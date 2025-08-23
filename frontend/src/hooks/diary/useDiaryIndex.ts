import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { diaryIndexAtom, diarySearchWordAtom, diaryModalViewAtom } from '../../state/atom';
import { fetchDiaryIndex } from '../../services/diaryService';
import { DiaryIndexItem } from '../../types/diary'

export const useDiaryIndex = () => {
  const [, setDiaryIndex] = useRecoilState(diaryIndexAtom);
  const [, setSearchWord] = useRecoilState(diarySearchWordAtom);
  const [diaryIndexList, setDiaryIndexList] = useState<DiaryIndexItem[]>([]);
  const [modalView] = useRecoilState(diaryModalViewAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiaryIndex = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDiaryIndex();
      setDiaryIndexList(result);
      if (result.length > 0) {
        setDiaryIndex(result[0].CREATEMONTH);
        setSearchWord('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diary index');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectMonth = (createMonth: string) => {
    setDiaryIndex(createMonth);
    setSearchWord('');
  };

  useEffect(() => {
    loadDiaryIndex();
  }, [modalView]);

  return {
    diaryIndexList,
    isLoading,
    error,
    selectMonth,
    reload: loadDiaryIndex
  };
};