import CompTodoSearch from "./todo/cTodoSearch";
import CompTodoCategory from "./todo/cTodoCategory";
import CompTodoTitle from "./todo/cTodoTitle";
import CompTodoList from "./todo/cTodoList";

export default function compTodoEdit() {

    return (
        <>
        <main className="frame2">
            <div className="frame-side2">
                <CompTodoSearch />
                <CompTodoCategory />
            </div>
            <div className="frame-center2">
                <CompTodoTitle />
                <CompTodoList />
            </div>
        </main>
        </>
    )
}