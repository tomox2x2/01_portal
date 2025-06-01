import CompHeader from '../comp/cHeader';
import CompFooter from '../comp/cFooter';
import CompTodoEdit from '../comp/cTodoEdit';
import CompTodoModal from "../comp/todo/cTodoModal";
import CompTodoDaySetDialogModal from "../comp/todo/cTodoDaySetDialogModal";

export default function TodoEdit() {
    return (
        <>
        <CompHeader strPageName={"Todo Edit"} 
                    setBackPage={true} 
                    setLogout={true} 
                    setTopPage={false}
                    setUserInfo={true}/>
        <CompTodoEdit />
        <CompFooter />
        <CompTodoModal />
        <CompTodoDaySetDialogModal/>
        </>
    );
}
