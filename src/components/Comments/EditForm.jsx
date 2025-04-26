import React, { useState } from 'react';
import styles from '../../pages/TrendsPage/TrendsPage.module.css';

const EditForm = ({ initialText, onSubmit, onCancel }) => {
  const [editText, setEditText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editText.trim() === '') return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(editText);
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.editForm} onSubmit={handleSubmit}>
      <textarea
        className={styles.editInput}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        placeholder="Редактировать комментарий..."
        required
      />
      <div className={styles.editFormButtons}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting || editText.trim() === ''}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
      </div>
    </form>
  );
};

export default EditForm; 