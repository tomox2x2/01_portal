import { useDiaryIndex } from '../../hooks/diary/useDiaryIndex';

export default function CompDiaryIndex() {
  const { diaryIndexList, isLoading, error, selectMonth } = useDiaryIndex();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="box-secound">
      <h2>Index</h2>
      <ul className="index-month">
        {diaryIndexList.map((item, index) => (
          <li key={index}>
            <button onClick={() => selectMonth(item.CREATEMONTH)}>
              {item.CREATEMONTH}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}