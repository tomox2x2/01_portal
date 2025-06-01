import CompHeader from '../comp/cHeader';
import CompFooter from '../comp/cFooter';
import CompDiary from '../comp/cDiary';
import CompDiaryModal from '../comp/diary/cDiaryModal';

export default function Diary() {
    return (
        <>
        <CompHeader strPageName={"Diary"} 
                    setBackPage={true} 
                    setLogout={true}
                    setTopPage={false}
                    setUserInfo={true}/>
        <CompDiary />
        <CompFooter />
        <CompDiaryModal />
        </>
    );
}
