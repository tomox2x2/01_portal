import CompDiarySearch from './diary/cDiarySearch';
import CompDiaryIndex from './diary/cDiaryIndex';
import CompDiaryTitle from './diary/cDiaryTitle';
import CompDiaryList from './diary/cDiaryList';

export default function compDiary() {
    return (
        <>
        <main className="frame2">
            <div className="frame-side2">
                <CompDiarySearch />
                <CompDiaryIndex />
            </div>
            <div className="frame-center2">
                <CompDiaryTitle />
                <CompDiaryList />
            </div>
        </main>
        </>
    )
}