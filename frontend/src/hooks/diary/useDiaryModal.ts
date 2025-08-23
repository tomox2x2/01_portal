import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { diaryModalViewAtom } from '../../state/atom';
import { fetchDiaryById, createDiary, updateDiary, deleteDiary } from '../../services/diaryService';
import { diaryFormSchema, DiaryFormData } from '../../validation/diary';

export const useDiaryModal = () => {
  const [diaryModalViewFlg, setDiaryModalViewFlg] = useRecoilState(diaryModalViewAtom);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubmitBtnLabel, setModalSubmitBtnLabel] = useState('');
  const [modalInputDisable, setModalInputDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<DiaryFormData>({
    defaultValues: { title: '', text: '' },
    resolver: yupResolver(diaryFormSchema),
  });

  const loadDiaryData = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const diary = await fetchDiaryById(id);
      setValue('title', diary.TITLE);
      setValue('text', diary.TEXT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diary data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: DiaryFormData) => {
    if (!confirm('新しく日記を登録します。よろしいですか？')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await createDiary(data);
      alert('新しく日記が登録されました。');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create diary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: DiaryFormData) => {
    if (!confirm('日記を更新します。よろしいですか？')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await updateDiary({ diaryId: diaryModalViewFlg.id, ...data });
      alert('日記が更新されました。');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update diary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (data: DiaryFormData) => {
    if (!confirm('日記を削除します。よろしいですか？')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await deleteDiary({ diaryId: diaryModalViewFlg.id, title: data.title });
      alert('日記が削除されました。');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    reset();
    setDiaryModalViewFlg({ mode: 0, id: 0 });
  };

  const onSubmit = async (data: DiaryFormData) => {
    switch (diaryModalViewFlg.mode) {
      case 1:
        await handleCreate(data);
        break;
      case 2:
        await handleUpdate(data);
        break;
      case 3:
        await handleDelete(data);
        break;
    }
  };

  useEffect(() => {
    switch (diaryModalViewFlg.mode) {
      case 1:
        setModalTitle("Create New Diary");
        setModalSubmitBtnLabel("Create");
        setModalInputDisable(false);
        reset();
        break;
      case 2:
        setModalTitle("Update Diary");
        setModalSubmitBtnLabel("Update");
        setModalInputDisable(false);
        loadDiaryData(diaryModalViewFlg.id);
        break;
      case 3:
        setModalTitle("Delete Diary");
        setModalSubmitBtnLabel("Delete");
        setModalInputDisable(true);
        loadDiaryData(diaryModalViewFlg.id);
        break;
      default:
        setModalTitle("error");
        setModalSubmitBtnLabel("error");
        setModalInputDisable(true);
        reset();
        break;
    }
  }, [diaryModalViewFlg.mode, diaryModalViewFlg.id]);

  return {
    // Modal state
    isOpen: diaryModalViewFlg.mode > 0,
    modalTitle,
    modalSubmitBtnLabel,
    modalInputDisable,
    isLoading,
    error,
    
    // Form
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    
    // Actions
    closeModal
  };
};
