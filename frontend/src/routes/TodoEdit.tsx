import CompHeader from '../comp/CompHeader';
import CompFooter from '../comp/CompFooter';
import CompTodoEdit from '../comp/CompTodoEdit';
import CompTodoModal from "../comp/todo/CompTodoModal";
import CompTodoDaySetDialogModal from "../comp/todo/CompTodoDaySetDialogModal";

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
