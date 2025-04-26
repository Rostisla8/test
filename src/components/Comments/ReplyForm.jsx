import React, { useState } from 'react';
import styles from '../../pages/TrendsPage/TrendsPage.module.css';

const ReplyForm = ({ onSubmit, onCancel }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (replyText.trim() === '') return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(replyText);
      setReplyText('');
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.replyForm} onSubmit={handleSubmit}>
      <textarea
        className={styles.replyInput}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Напишите ваш ответ..."
        required
      />
      <div className={styles.replyFormButtons}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting || replyText.trim() === ''}
        >
          {isSubmitting ? 'Отправка...' : 'Ответить'}
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

export default ReplyForm; 