import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function CompSignUp() {

    const navigate = useNavigate();
    
    const { handleSubmit, } = useForm({
    });

    const onsubmit = () => {
        navigate("/newAC");
    };

    return (
        <form onSubmit={handleSubmit(onsubmit)} className="signUp">
            <div className="button-center">
                <button type="submit">新規登録</button>
            </div>
        </form>
    );
}