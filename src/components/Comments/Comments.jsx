import React, { useState, useEffect } from 'react';
import styles from './Comments.module.css';
import { useAuthContext } from '../../contexts/AuthContext';
import commentService from '../../services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();

  // Загрузка комментариев
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await commentService.getComments(postId);
        if (response.success) {
          setComments(response.comments || []);
        } else {
          throw new Error(response.message || 'Не удалось загрузить комментарии');
        }
      } catch (err) {
        console.error('Ошибка при загрузке комментариев:', err);
        setError('Не удалось загрузить комментарии');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Добавление нового комментария
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser?.telegramId) return;
    
    setIsLoading(true);
    
    try {
      const response = await commentService.addComment(postId, currentUser.telegramId, newComment);
      if (response.success) {
        setComments(prevComments => [response.comment, ...prevComments]);
        setNewComment('');
      } else {
        throw new Error(response.message || 'Не удалось добавить комментарий');
      }
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      setError('Не удалось добавить комментарий');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка лайка на комментарий
  const handleLike = async (commentId) => {
    if (!currentUser?.telegramId) return;
    
    try {
      const comment = comments.find(c => c.id === commentId);
      const isLiked = comment?.has_liked;
      
      // Оптимистичное обновление UI
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                has_liked: !isLiked,
                like_count: isLiked ? Math.max(0, (comment.like_count || 0) - 1) : (comment.like_count || 0) + 1
              } 
            : comment
        )
      );
      
      // Отправка запроса на сервер
      if (isLiked) {
        await commentService.unlikeComment(commentId, currentUser.telegramId);
      } else {
        await commentService.likeComment(commentId, currentUser.telegramId);
      }
    } catch (err) {
      console.error('Ошибка при лайке комментария:', err);
      // Если произошла ошибка, откатываем изменения
      const comment = comments.find(c => c.id === commentId);
      const isLiked = comment?.has_liked;
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                has_liked: isLiked,
                like_count: comment.like_count
              } 
            : comment
        )
      );
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const distanceStr = formatDistanceToNow(new Date(timestamp), { locale: ru });
      return distanceStr.replace('около ', '');
    } catch (err) {
      return '';
    }
  };

  // Удаление комментария
  const handleDelete = async (commentId) => {
    if (!currentUser?.telegramId) return;
    
    if (window.confirm('Удалить этот комментарий?')) {
      setIsLoading(true);
      
      try {
        const response = await commentService.deleteComment(commentId, currentUser.telegramId);
        if (response.success) {
          setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        } else {
          throw new Error(response.message || 'Не удалось удалить комментарий');
        }
      } catch (err) {
        console.error('Ошибка при удалении комментария:', err);
        setError('Не удалось удалить комментарий');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Показать все комментарии
  const showAllComments = () => {
    // Здесь можно реализовать загрузку всех комментариев, 
    // если их много и они загружаются постранично
  }

  return (
    <div className={styles.comments}>
      {/* Количество комментариев */}
      {comments.length > 0 && (
        <div className={styles.commentsCount}>
          {comments.length > 2 ? (
            <button className={styles.viewAllComments} onClick={showAllComments}>
              Просмотреть все комментарии ({comments.length})
            </button>
          ) : (
            <span className={styles.commentsCounter}>{comments.length} комментариев</span>
          )}
        </div>
      )}
      
      {/* Список комментариев (показываем только 2 последних) */}
      {isLoading && comments.length === 0 ? (
        <div className={styles.loading}>Загрузка комментариев...</div>
      ) : (
        <div className={styles.commentsList}>
          {comments.slice(0, 2).map(comment => (
            <div key={comment.id} className={styles.commentItem}>
              <span className={styles.username}>{comment.first_name || 'Пользователь'}</span>
              <span className={styles.commentText}>{comment.content}</span>
              {comment.like_count > 0 && (
                <button 
                  className={`${styles.likeButton} ${comment.has_liked ? styles.liked : ''}`}
                  onClick={() => handleLike(comment.id)}
                >
                  ♥
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Время публикации */}
      <div className={styles.postTime}>
        {comments.length > 0 && comments[0]?.created_at && (
          <span>{formatTimeAgo(comments[0].created_at)}</span>
        )}
      </div>
      
      {/* Сообщение об ошибке */}
      {error && <div className={styles.error}>{error}</div>}
      
      {/* Форма добавления комментария */}
      {currentUser?.telegramId && (
        <form className={styles.commentForm} onSubmit={handleAddComment}>
          <input
            type="text"
            className={styles.commentInput}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Добавить комментарий..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={styles.postButton}
            disabled={isLoading || !newComment.trim()}
          >
            Опубликовать
          </button>
        </form>
      )}
    </div>
  );
};

export default Comments; 