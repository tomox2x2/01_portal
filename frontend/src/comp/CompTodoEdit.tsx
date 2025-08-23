import CompTodoSearch from "./todo/CompTodoSearch";
import CompTodoCategory from "./todo/CompTodoCategory";
import CompTodoTitle from "./todo/CompTodoTitle";
import CompTodoList from "./todo/CompTodoList";

export default function CompTodoEdit() {

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