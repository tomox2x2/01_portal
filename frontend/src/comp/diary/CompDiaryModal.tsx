import { useDiaryModal } from '../../hooks/diary/useDiaryModal';

export default function CompDiaryModal() {
  const {
    isOpen,
    modalTitle,
    modalSubmitBtnLabel,
    modalInputDisable,
    isLoading,
    error,
    register,
    handleSubmit,
    errors,
    closeModal
  } = useDiaryModal();

  if (!isOpen) return null;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="overlay">
      <div id="modalView">
        <div className="title"><h1>{modalTitle}</h1></div>
        <form onSubmit={handleSubmit}>
          <dl>
            <dt>Title:</dt>
            <dd><input id="title" type="text" autoComplete="off" {...register('title')} disabled={modalInputDisable} /></dd>
            <dt></dt>
            <dd className='alert'>{errors.title?.message}</dd>
            <dt>Text:</dt>
            <dd><textarea id="text" autoComplete="off" {...register('text')} disabled={modalInputDisable} /></dd>
            <dt></dt>
            <dd className='alert'>{errors.text?.message}</dd>
          </dl>
          <div className="buttonArea button">
            <button type='submit'>{modalSubmitBtnLabel}</button>
            <input className='button' type='button' autoComplete="off" value='Leave' onClick={closeModal} />
          </div>
        </form>
      </div>
    </div>
  );
}