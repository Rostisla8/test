import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaReply, FaThumbsUp, FaTrash, FaEdit } from 'react-icons/fa';
import ReplyForm from './ReplyForm';
import EditForm from './EditForm';
import styles from '../../pages/TrendsPage/TrendsPage.module.css';
import Avatar from '../Avatar/Avatar';
import commentService from '../../services/commentService';
import { formatDistanceToNow } from 'date-fns';

const CommentItem = ({ 
  comment, 
  currentUser, 
  postId, 
  onReplyAdded, 
  onCommentDeleted, 
  onCommentUpdated,
  onLiked
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replies, setReplies] = useState(comment.replies || []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySubmit = async (replyText) => {
    try {
      setIsLoading(true);
      // Используем обновленный API для добавления ответа
      const result = await commentService.addReply(
        postId, 
        comment.id, 
        currentUser.telegramId, 
        replyText
      );
      
      if (result.success && result.comment) {
        // Обновляем список ответов
        setReplies(prev => [...prev, result.comment]);
        setShowReplies(true);
        setShowReplyForm(false);
        
        // Вызываем колбэк, если он есть
        if (onReplyAdded) {
          onReplyAdded(comment.id, result.comment);
        }
      } else {
        throw new Error('Не удалось добавить ответ');
      }
    } catch (error) {
      console.error('Ошибка при добавлении ответа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        setIsLoading(true);
        // Используем обновленный API для удаления комментария
        const result = await commentService.deleteComment(
          comment.id, 
          currentUser.telegramId
        );
        
        if (result.success) {
          if (onCommentDeleted) {
            onCommentDeleted(comment.id, result.deleted_replies_count || 0);
          }
        } else {
          throw new Error('Не удалось удалить комментарий');
        }
      } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSubmit = async (editedText) => {
    try {
      setIsLoading(true);
      // Используем обновленный API для обновления комментария
      const result = await commentService.updateComment(
        comment.id, 
        currentUser.telegramId, 
        editedText
      );
      
      if (result && result.success) {
        // Обновляем данные комментария в родительском компоненте
        if (onCommentUpdated) {
          onCommentUpdated(comment.id, { ...comment, content: editedText });
        }
        
        setIsEditing(false);
      } else {
        throw new Error('Не удалось обновить комментарий');
      }
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeClick = async () => {
    try {
      setIsLoading(true);
      const isLiked = comment.liked;
      
      if (isLiked) {
        await commentService.unlikeComment(comment.id);
      } else {
        await commentService.likeComment(comment.id);
      }
      
      if (onLiked) {
        onLiked(comment.id, !isLiked);
      }
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && (!replies || replies.length === 0)) {
      try {
        setIsLoading(true);
        const result = await commentService.getReplies(postId, comment.id);
        if (result.success && result.comments) {
          setReplies(result.comments);
        }
      } catch (error) {
        console.error('Ошибка при получении ответов:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const isCommentOwner = currentUser && currentUser.telegram_id === comment.telegram_id;
  const hasLiked = currentUser && comment.likedBy && comment.likedBy.includes(currentUser.id);
  
  const formattedDate = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ru })
    : '';

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <div className={styles.commentAvatar}>
          {comment.photo_url ? (
            <img src={comment.photo_url} alt={comment.first_name} />
          ) : (
            <Avatar alt={comment.first_name || 'Пользователь'} size="small" />
          )}
        </div>
        <div className={styles.commentInfo}>
          <div className={styles.commentAuthor}>
            {comment.first_name} {comment.last_name || ''}
          </div>
          <div className={styles.commentDate}>{formattedDate}</div>
        </div>
        
        {/* Кнопка удаления для своих комментариев */}
        {isCommentOwner && (
          <button 
            className={styles.deleteCommentBtn}
            onClick={handleDeleteClick}
            disabled={isLoading}
          >
            <FaTrash size={12} />
          </button>
        )}
      </div>
      
      <div className={styles.commentContent}>
        {isEditing ? (
          <EditForm 
            initialText={comment.content} 
            onSubmit={handleEditSubmit} 
            onCancel={handleEditCancel} 
          />
        ) : (
          <div className={styles.commentText}>{comment.content}</div>
        )}
      </div>
      
      <div className={styles.commentActions}>
        <button 
          className={styles.actionButton} 
          onClick={handleReplyClick}
          disabled={isLoading}
        >
          <FaReply className={styles.actionIcon} /> Ответить
        </button>
        
        {isCommentOwner && !isEditing && (
          <button 
            className={styles.actionButton} 
            onClick={handleEditClick}
            disabled={isLoading}
          >
            <FaEdit className={styles.actionIcon} /> Изменить
          </button>
        )}
      </div>
      
      {comment.reply_count > 0 && (
        <div className={styles.repliesToggle}>
          <button 
            onClick={toggleReplies} 
            className={styles.repliesButton}
          >
            {showReplies ? 'Скрыть ответы' : `Показать ответы (${comment.reply_count})`}
          </button>
        </div>
      )}
      
      {showReplies && replies && replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              postId={postId}
              onReplyAdded={onReplyAdded}
              onCommentDeleted={onCommentDeleted}
              onCommentUpdated={onCommentUpdated}
              onLiked={onLiked}
            />
          ))}
        </div>
      )}
      
      {showReplyForm && (
        <ReplyForm 
          onSubmit={handleReplySubmit} 
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      
      {isLoading && <div className={styles.commentLoading}>Загрузка...</div>}
    </div>
  );
};

export default CommentItem; 