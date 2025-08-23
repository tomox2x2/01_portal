import { useDiarySearch } from '../../hooks/diary/useDiarySearch';

export default function CompDiarySearch() {
  const { inputValue, setInputValue, register, handleSubmit, errors } = useDiarySearch();

  return (
    <div className="box-first">
      <h2>Search</h2>
      <form onSubmit={handleSubmit} className="diarySearch">
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