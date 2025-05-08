import React, { useState, useEffect } from 'react';
import styles from './Comments.module.css';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import commentService from '../../services/commentService';
import ReplyForm from './ReplyForm';

const PostComments = ({ postId, currentUser, onClose }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Загрузка комментариев
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      
      try {
        const response = await commentService.getComments(postId);
        if (response.success) {
          setComments(response.comments || []);
        } else {
          setError('Не удалось загрузить комментарии');
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
  
  // Форматирование времени
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
    } catch (err) {
      return '';
    }
  };
  
  // Добавление комментария
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
        setError('Не удалось добавить комментарий');
      }
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      setError('Не удалось добавить комментарий');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Добавление ответа
  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim() || !currentUser?.telegramId) return;
    
    setIsLoading(true);
    
    try {
      const response = await commentService.addReply(postId, commentId, currentUser.telegramId, replyText);
      
      if (response.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  replies: [...(comment.replies || []), response.comment],
                  reply_count: (comment.reply_count || 0) + 1
                } 
              : comment
          )
        );
        
        setReplyingTo(null);
      } else {
        setError('Не удалось добавить ответ');
      }
    } catch (err) {
      console.error('Ошибка при добавлении ответа:', err);
      setError('Не удалось добавить ответ');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Удаление комментария или ответа
  const handleDelete = async (commentId) => {
    if (!currentUser?.telegramId) return;
    
    if (window.confirm('Удалить этот комментарий?')) {
      setIsLoading(true);
      
      try {
        const response = await commentService.deleteComment(commentId, currentUser.telegramId);
        
        if (response.success) {
          // Проверяем, является ли это ответом на комментарий
          const parentComment = comments.find(comment => 
            comment.replies && comment.replies.some(reply => reply.id === commentId)
          );
          
          if (parentComment) {
            // Это ответ - обновляем родительский комментарий
            setComments(prevComments => 
              prevComments.map(comment => 
                comment.id === parentComment.id 
                  ? { 
                      ...comment, 
                      replies: comment.replies.filter(reply => reply.id !== commentId),
                      reply_count: Math.max(0, (comment.reply_count || 0) - 1)
                    } 
                  : comment
              )
            );
          } else {
            // Это основной комментарий
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
          }
        } else {
          setError('Не удалось удалить комментарий');
        }
      } catch (err) {
        console.error('Ошибка при удалении комментария:', err);
        setError('Не удалось удалить комментарий');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Загрузка ответов
  const loadReplies = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    
    // Если ответы уже загружены или комментарий не имеет ответов
    if ((comment.replies && comment.replies.length > 0) || !comment.reply_count) return;
    
    setIsLoading(true);
    
    try {
      const response = await commentService.getReplies(postId, commentId);
      
      if (response.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, replies: response.comments || [] } 
              : comment
          )
        );
      } else {
        setError('Не удалось загрузить ответы');
      }
    } catch (err) {
      console.error('Ошибка при загрузке ответов:', err);
      setError('Не удалось загрузить ответы');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.comments}>
      <div className={styles.commentsHeader}>
        <h4>Комментарии {comments.length > 0 && `(${comments.length})`}</h4>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        )}
      </div>
      
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
      
      {/* Сообщение об ошибке */}
      {error && <div className={styles.error}>{error}</div>}
      
      {/* Список комментариев */}
      {isLoading && comments.length === 0 ? (
        <div className={styles.loading}>Загрузка комментариев...</div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.commentItem}>
              {/* Основная часть комментария */}
              <div className={styles.commentMain}>
                <span className={styles.username}>{comment.first_name || 'Пользователь'}</span>
                <span className={styles.commentText}>{comment.content}</span>
              </div>
              
              {/* Информация и действия */}
              <div className={styles.commentMeta}>
                <span className={styles.timestamp}>{formatTimeAgo(comment.created_at)}</span>
                {comment.like_count > 0 && (
                  <span className={styles.likes}>{comment.like_count} нравится</span>
                )}
                <button 
                  className={styles.replyButton} 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  Ответить
                </button>
                {currentUser?.telegramId === comment.telegram_id && (
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => handleDelete(comment.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
              
              {/* Форма ответа на комментарий */}
              {replyingTo === comment.id && (
                <ReplyForm 
                  onSubmit={(text) => handleReply(comment.id, text)} 
                  onCancel={() => setReplyingTo(null)}
                />
              )}
              
              {/* Кнопка загрузки ответов */}
              {comment.reply_count > 0 && (!comment.replies || comment.replies.length === 0) && (
                <button 
                  className={styles.viewMoreButton}
                  onClick={() => loadReplies(comment.id)}
                >
                  Показать ответы ({comment.reply_count})
                </button>
              )}
              
              {/* Ответы на комментарий */}
              {comment.replies && comment.replies.length > 0 && (
                <div className={styles.replies}>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className={styles.commentItem}>
                      <div className={styles.commentMain}>
                        <span className={styles.username}>{reply.first_name || 'Пользователь'}</span>
                        <span className={styles.commentText}>{reply.content}</span>
                      </div>
                      <div className={styles.commentMeta}>
                        <span className={styles.timestamp}>{formatTimeAgo(reply.created_at)}</span>
                        {reply.like_count > 0 && (
                          <span className={styles.likes}>{reply.like_count} нравится</span>
                        )}
                        {currentUser?.telegramId === reply.telegram_id && (
                          <button 
                            className={styles.deleteButton} 
                            onClick={() => handleDelete(reply.id)}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Сообщение, если нет комментариев */}
      {!isLoading && comments.length === 0 && (
        <div className={styles.noComments}>Пока нет комментариев</div>
      )}
    </div>
  );
};

export default PostComments; 