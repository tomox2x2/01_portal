import CompDiarySearch from './diary/CompDiarySearch';
import CompDiaryIndex from './diary/CompDiaryIndex';
import CompDiaryTitle from './diary/CompDiaryTitle';
import CompDiaryList from './diary/CompDiaryList';

export default function CompDiary() {
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