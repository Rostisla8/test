import React, { useState } from 'react';
import styles from './Comments.module.css';

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
    <div className={styles.replyForm}>
      <input
        type="text"
        className={styles.replyInput}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Добавить ответ..."
        disabled={isSubmitting}
      />
      <div className={styles.replyButtons}>
        <button 
          type="button" 
          className={styles.cancelReply}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button 
          type="button" 
          className={styles.submitReply}
          onClick={handleSubmit}
          disabled={isSubmitting || replyText.trim() === ''}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ReplyForm; 