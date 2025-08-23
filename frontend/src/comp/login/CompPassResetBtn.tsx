import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function CompPassResetBtn() {

    const navigate = useNavigate();

    const { handleSubmit } = useForm({
        defaultValues: {},
    });

    const onsubmit = async () => {
        navigate("/passReset")
    }    

    const onerror = (err:any) => console.log(err);

    return (
            <form onSubmit={handleSubmit(onsubmit, onerror)} className="passReset">
                <button type="submit" className='link'>パスワードリセット</button>
            </form>
    );
}