import CompHeader from '../comp/CompHeader';
import CompFooter from '../comp/CompFooter';
import CompDiary from '../comp/CompDiary';
import CompDiaryModal from '../comp/diary/CompDiaryModal';

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
