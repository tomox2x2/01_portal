import { useDiaryList } from '../../hooks/diary/useDiaryList';

export default function CompDiaryList() {
  const { diaryList, isLoading, error, openUpdateModal, openDeleteModal } = useDiaryList();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="frame-center-child">
      {diaryList.map((diary, index) => (
        <div key={index} className="dairy">
          <div className="dairy-head">
            <h1 className="dairy-title">
              {diary.TITLE}
              <br />
            </h1>
            <div className="dairy-head-right">
              <div className="dairy-head-date">
                Create:{diary.CREATEDATE} / Update:{diary.UPDATEDATE}
              </div>
              <div className="dairy-head-btn">
                <button className="btn-min1" onClick={() => openUpdateModal(diary.DIARYID)}>
                  Update
                </button>
                <button className="btn-min1" onClick={() => openDeleteModal(diary.DIARYID)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div className="dairy-bottom">{diary.TEXT}</div>
        </div>
      ))}
    </div>
  );
}

