import { connBackendPost } from '../api/conn';
import { screenInfo, screenAct } from '../state/baseInfo';
import {
  DiaryIndexItem,
  Diary,
  DiaryListParams,
  CreateDiaryPayload,
  UpdateDiaryPayload,
  DeleteDiaryPayload
} from '../types/diary';

export async function fetchDiaryIndex(): Promise<DiaryIndexItem[]> {
  return await connBackendPost('/diary/index');
}

export async function fetchDiaryList(params: DiaryListParams): Promise<Diary[]> {
  return await connBackendPost('/diary/list', params);
}

export async function fetchDiaryById(id: number): Promise<Diary> {
  const result = await connBackendPost('/diary/list', { id });
  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Diary;
  }
  throw new Error('Diary not found');
}

export async function createDiary(payload: CreateDiaryPayload): Promise<void> {
  await connBackendPost('/diary/create', payload, screenInfo.DIARY, screenAct.INSERT);
}

export async function updateDiary(payload: UpdateDiaryPayload): Promise<void> {
  await connBackendPost('/diary/update', payload, screenInfo.DIARY, screenAct.UPDATE);
}

export async function deleteDiary(payload: DeleteDiaryPayload): Promise<void> {
  await connBackendPost('/diary/delete', payload, screenInfo.DIARY, screenAct.DELETE);
}