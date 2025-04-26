import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import styles from '../../pages/TrendsPage/TrendsPage.module.css';
import { useAuthContext } from '../../contexts/AuthContext';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();

  // Загрузка комментариев
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Здесь будет запрос к API для получения комментариев
        // Временное решение с демо-данными
        const demoComments = [
          {
            id: '1',
            text: 'Отличная статья! Очень познавательно.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            user: {
              id: '101',
              name: 'Алексей Петров',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            likes: 5,
            likedBy: [],
            replies: [
              {
                id: '1-1',
                text: 'Полностью согласен с вами!',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                user: {
                  id: '102',
                  name: 'Мария Иванова',
                  avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
                },
                likes: 2,
                likedBy: []
              }
            ]
          },
          {
            id: '2',
            text: 'Интересный подход к этой теме, но я не совсем согласен с некоторыми пунктами.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            user: {
              id: '103',
              name: 'Сергей Сидоров',
              avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            likes: 3,
            likedBy: [],
            replies: []
          }
        ];
        
        setComments(demoComments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Не удалось загрузить комментарии. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Добавление нового комментария
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Здесь будет запрос к API для добавления комментария
      // Временное решение для демонстрации
      const newCommentData = {
        id: `comment-${Date.now()}`,
        text: newComment,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser.id,
          name: currentUser.displayName || 'Пользователь',
          avatar: currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        likes: 0,
        likedBy: [],
        replies: []
      };
      
      setComments(prevComments => [newCommentData, ...prevComments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Не удалось добавить комментарий. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для действий с комментариями
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      setIsLoading(true);
      
      try {
        // Здесь будет запрос к API для удаления комментария
        // Временное решение для демонстрации
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
      } catch (err) {
        console.error('Failed to delete comment:', err);
        setError('Не удалось удалить комментарий. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditComment = async (commentId, newText) => {
    setIsLoading(true);
    
    try {
      // Здесь будет запрос к API для редактирования комментария
      // Временное решение для демонстрации
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, text: newText, updatedAt: new Date().toISOString() } 
            : comment
        )
      );
    } catch (err) {
      console.error('Failed to edit comment:', err);
      setError('Не удалось отредактировать комментарий. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) return;
    
    try {
      // Здесь будет запрос к API для добавления/удаления лайка
      // Временное решение для демонстрации
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            const userLiked = comment.likedBy.includes(currentUser.id);
            return {
              ...comment,
              likes: userLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: userLiked 
                ? comment.likedBy.filter(id => id !== currentUser.id)
                : [...comment.likedBy, currentUser.id]
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Failed to like comment:', err);
      setError('Не удалось поставить лайк. Пожалуйста, попробуйте позже.');
    }
  };

  const handleAddReply = async (commentId, replyText) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Здесь будет запрос к API для добавления ответа
      // Временное решение для демонстрации
      const newReply = {
        id: `reply-${Date.now()}`,
        text: replyText,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser.id,
          name: currentUser.displayName || 'Пользователь',
          avatar: currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        likes: 0,
        likedBy: []
      };
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...comment.replies, newReply] } 
            : comment
        )
      );
    } catch (err) {
      console.error('Failed to add reply:', err);
      setError('Не удалось добавить ответ. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.commentsContainer}>
      <h3 className={styles.commentsTitle}>Комментарии ({comments.length})</h3>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {currentUser ? (
        <form className={styles.commentForm} onSubmit={handleAddComment}>
          <textarea
            className={styles.commentInput}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите ваш комментарий..."
            disabled={isLoading}
            required
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading || !newComment.trim()}
          >
            {isLoading ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Войдите, чтобы оставить комментарий
        </div>
      )}
      
      {isLoading && comments.length === 0 ? (
        <div className={styles.loading}>Загрузка комментариев...</div>
      ) : comments.length > 0 ? (
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              postId={postId}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
              onLikeComment={handleLikeComment}
              onAddReply={handleAddReply}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noComments}>
          Комментариев пока нет. Будьте первым!
        </div>
      )}
    </div>
  );
};

export default Comments; 