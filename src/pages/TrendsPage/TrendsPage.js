import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TrendsPage.module.css';
import NewsHeader from '../../components/NewsHeader/NewsHeader';
import { FaUser, FaPaperPlane, FaImage, FaSmile, FaVideo, FaTimes, FaHeart, FaComment, FaRetweet, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import EditForm from '../../components/Comments/EditForm';
import commentService from '../../services/commentService';

const TrendsPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Состояние для подгрузки дополнительных постов
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true); // Есть ли еще посты для загрузки
  const [offset, setOffset] = useState(0); // Смещение для пагинации
  const limit = 10; // Количество постов, загружаемых за раз
  
  // Новые состояния для комментариев
  const [expandedComments, setExpandedComments] = useState(null); // ID поста, для которого открыты комментарии
  const [comments, setComments] = useState({}); // Объект с комментариями для каждого поста
  const [expandedReplies, setExpandedReplies] = useState({}); // Объект с ID комментариев, для которых открыты ответы
  const [loadingComments, setLoadingComments] = useState(false); // Загрузка комментариев
  const [loadingReplies, setLoadingReplies] = useState({}); // Загрузка ответов на комментарии
  const [newCommentText, setNewCommentText] = useState(''); // Текст нового комментария
  const [replyToComment, setReplyToComment] = useState(null); // ID комментария, на который отвечаем
  const [newReplyText, setNewReplyText] = useState(''); // Текст нового ответа
  const [submittingComment, setSubmittingComment] = useState(false); // Отправка комментария
  
  // Добавляем новые состояния для редактирования комментариев
  const [editingComment, setEditingComment] = useState(null); // ID комментария, который редактируется
  
  const API_BASE_URL = 'https://cy35179.tw1.ru'; // Базовый URL API
  
  const fileInputRef = useRef(null);
  const observerRef = useRef(null); // Ref для IntersectionObserver
  const loadMoreRef = useRef(null); // Ref для элемента, который отслеживаем для загрузки
  const commentInputRef = useRef(null); // Ref для поля ввода комментария

  const [currentUser, setCurrentUser] = useState({
    name: 'rostisla888',
    avatar: null,
    telegramId: null,
  });

  // Получение данных пользователя из Telegram WebApp API
  useEffect(() => {
    const initTelegramUser = () => {
      try {
        // Проверяем, доступен ли Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Инициализируем WebApp
          webApp.ready();
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe?.user;
          
          if (user && user.id) {
            console.log('Telegram user data:', user);
            
            // Обновляем данные пользователя
            setCurrentUser(prevState => ({
              ...prevState,
              name: user.first_name || user.username || `${user.first_name} ${user.last_name || ''}`.trim() || 'Пользователь',
              telegramId: user.id,
              avatar: null // У WebApp API нет прямого доступа к аватару
            }));
          } else {
            console.warn('Не удалось получить данные пользователя из Telegram WebApp');
            // Используем ID по умолчанию для отладки (в продакшене следует уведомить пользователя)
            setCurrentUser(prevState => ({
              ...prevState,
              telegramId: 12345678 // ID по умолчанию для отладки
            }));
          }
        } else {
          console.warn('Telegram WebApp не доступен');
          // Используем ID по умолчанию для отладки (в продакшене следует уведомить пользователя)
          setCurrentUser(prevState => ({
            ...prevState,
            telegramId: 12345678 // ID по умолчанию для отладки
          }));
        }
      } catch (error) {
        console.error('Ошибка инициализации Telegram WebApp:', error);
        // Используем ID по умолчанию для отладки (в продакшене следует уведомить пользователя)
        setCurrentUser(prevState => ({
          ...prevState,
          telegramId: 12345678 // ID по умолчанию для отладки
        }));
      }
    };
    
    initTelegramUser();
  }, []);

  // Загрузка постов из API при получении telegramId
  useEffect(() => {
    if (currentUser.telegramId) {
      fetchPosts();
    }
  }, [currentUser.telegramId]);

  // Настройка IntersectionObserver для бесконечной прокрутки
  useEffect(() => {
    // Функция обратного вызова для наблюдателя
    const handleObserver = (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore && currentUser.telegramId) {
        loadMorePosts();
      }
    };

    // Создание нового наблюдателя
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    // Отслеживаем элемент загрузки, если он существует и есть еще посты
    if (loadMoreRef.current && hasMore) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingMore, currentUser.telegramId]);

  // Функция форматирования URL изображения с добавлением домена API, если необходимо
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Проверяем, начинается ли URL с http:// или https://
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl; // Уже полный URL
    }
    
    // Проверяем, начинается ли URL с "/"
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // Иначе добавляем слеш и домен
    return `${API_BASE_URL}/${imageUrl}`;
  };

  // Функция загрузки постов из API (первоначальная загрузка)
  const fetchPosts = async () => {
    if (!currentUser.telegramId) {
      console.error('Отсутствует telegramId пользователя');
      setError('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOffset(0); // Сбрасываем смещение
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?limit=${limit}&offset=0&viewer_telegram_id=${currentUser.telegramId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Полученные посты:', data);
      
      if (data.success) {
        // Преобразуем данные из API в формат, который использует наш компонент
        const formattedPosts = data.posts.map(post => ({
          id: post.id || Date.now(),
          text: post.content || '',
          author: post.first_name || post.author || currentUser.name,
          avatar: post.avatar ? formatImageUrl(post.avatar) : null,
          timestamp: post.created_at || new Date().toISOString(),
          likeCount: post.like_count || 0,
          hasLiked: post.has_liked || false,
          comments: post.comment_count || post.comments || 0, // Используем новое поле comment_count, с запасным вариантом
          image: post.image_url ? formatImageUrl(post.image_url) : null
        }));
        
        setPosts(formattedPosts);
        setHasMore(data.has_more);
        setOffset(limit); // Устанавливаем смещение для следующей загрузки
      } else {
        throw new Error('Запрос не удался');
      }
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
      setError('Не удалось загрузить посты. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция загрузки дополнительных постов (при прокрутке)
  const loadMorePosts = async () => {
    if (!currentUser.telegramId || !hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?limit=${limit}&offset=${offset}&viewer_telegram_id=${currentUser.telegramId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Дополнительные посты:', data);
      
      if (data.success) {
        // Преобразуем данные из API в формат, который использует наш компонент
        const formattedPosts = data.posts.map(post => ({
          id: post.id || Date.now(),
          text: post.content || '',
          author: post.first_name || post.author || currentUser.name,
          avatar: post.avatar ? formatImageUrl(post.avatar) : null,
          timestamp: post.created_at || new Date().toISOString(),
          likeCount: post.like_count || 0,
          hasLiked: post.has_liked || false,
          comments: post.comment_count || post.comments || 0, // Используем новое поле comment_count, с запасным вариантом
          image: post.image_url ? formatImageUrl(post.image_url) : null
        }));
        
        // Добавляем новые посты к существующим
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
        setHasMore(data.has_more);
        setOffset(prev => prev + limit); // Увеличиваем смещение для следующей загрузки
      } else {
        throw new Error('Запрос не удался');
      }
    } catch (error) {
      console.error('Ошибка при загрузке дополнительных постов:', error);
      // Не устанавливаем глобальную ошибку, только логируем
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Функция для добавления/удаления лайка
  const handleLikeToggle = async (postId, hasLiked) => {
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }

    try {
      // Оптимистичное обновление UI
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasLiked: !hasLiked, 
                likeCount: hasLiked ? post.likeCount - 1 : post.likeCount + 1 
              } 
            : post
        )
      );

      if (!hasLiked) {
        // Добавление лайка
        const response = await fetch(`${API_BASE_URL}/api/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_id: postId,
            telegram_id: currentUser.telegramId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Лайк добавлен:', data);
      } else {
        // Удаление лайка
        const response = await fetch(`${API_BASE_URL}/api/likes?post_id=${postId}&telegram_id=${currentUser.telegramId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Лайк удален:', data);
      }
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
      
      // В случае ошибки возвращаем предыдущее состояние
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasLiked: hasLiked, 
                likeCount: hasLiked ? post.likeCount : post.likeCount - 1 
              } 
            : post
        )
      );
      
      alert('Произошла ошибка при обработке лайка. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Функция для выбора изображения
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Создаем превью изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для удаления выбранного изображения
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Обработчик отправки нового поста
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!newPostText.trim() && !selectedImage) return;
    
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Создаем FormData для отправки данных и файла
      const formData = new FormData();
      
      // Добавляем JSON данные
      formData.append('json_data', JSON.stringify({
        telegram_id: currentUser.telegramId,
        content: newPostText
      }));
      
      // Добавляем изображение, если оно выбрано
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      // Отправляем данные на сервер
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      // После успешной отправки обновляем список постов
      fetchPosts();
      
      // Сбрасываем форму
      setNewPostText('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Ошибка при отправке поста:', error);
      alert('Произошла ошибка при отправке поста. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsUploading(false);
    }
  };

  // Форматирование времени публикации
  const formatPostTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours === 1) {
      return '1 ч.';
    } else if (diffInHours < 24) {
      return `${diffInHours} ч.`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} д.`;
    }
  };

  // Функция для открытия/закрытия раздела комментариев поста
  const toggleComments = async (postId) => {
    if (expandedComments === postId) {
      // Закрываем комментарии
      setExpandedComments(null);
    } else {
      // Открываем комментарии и загружаем их, если еще не загружены
      setExpandedComments(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  // Функция для загрузки комментариев к посту
  const fetchComments = async (postId) => {
    if (!postId) return;
    
    setLoadingComments(true);
    
    try {
      // Получаем комментарии для поста через сервис
      const response = await commentService.getComments(postId);
      
      if (response.success) {
        // Если ответ успешный, обновляем состояние комментариев
        setComments(prevComments => ({
          ...prevComments,
          [postId]: response.comments.map(comment => ({
            ...comment,
            has_liked: comment.has_liked || false // Убедимся, что поле has_liked всегда определено
          }))
        }));
      } else {
        throw new Error(response.message || 'Не удалось получить комментарии');
      }
    } catch (error) {
      console.error('Ошибка при загрузке комментариев:', error);
      setComments(prevComments => ({
        ...prevComments,
        [postId]: []
      }));
    } finally {
      setLoadingComments(false);
    }
  };

  // Функция для загрузки ответов на комментарий
  const fetchReplies = async (postId, commentId) => {
    if (!postId || !commentId) return;
    
    // Устанавливаем состояние загрузки для этого конкретного комментария
    setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    
    try {
      // Получаем ответы на комментарий через сервис
      const response = await commentService.getReplies(postId, commentId);
      
      if (response.success) {
        // Обновляем состояние комментариев, добавляя ответы к комментарию
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          const commentIndex = postComments.findIndex(c => c.id === commentId);
          
          if (commentIndex !== -1) {
            // Добавляем обработку поля has_liked для каждого ответа
            postComments[commentIndex].replies = response.comments.map(reply => ({
              ...reply,
              has_liked: reply.has_liked || false // Убедимся, что поле has_liked всегда определено
            }));
            
            // Устанавливаем количество ответов
            postComments[commentIndex].reply_count = response.comments.length;
          }
          
          return {
            ...prevComments,
            [postId]: postComments
          };
        });
      } else {
        throw new Error(response.message || 'Не удалось получить ответы на комментарий');
      }
    } catch (error) {
      console.error('Ошибка при загрузке ответов на комментарий:', error);
      setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Функция для отправки комментария
  const submitComment = async (postId) => {
    if (!newCommentText.trim()) return;
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }
    
    setSubmittingComment(true);
    
    try {
      const response = await commentService.addComment(postId, currentUser.telegramId, newCommentText);
      
      if (response.success && response.comment) {
        // Добавляем новый комментарий в список
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          postComments.push(response.comment);
          
          return {
            ...prevComments,
            [postId]: postComments
          };
        });
        
        // Увеличиваем счетчик комментариев к посту
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comments: post.comments + 1 
                } 
              : post
          )
        );
        
        // Очищаем поле ввода
        setNewCommentText('');
      } else {
        throw new Error(response.message || 'Не удалось добавить комментарий');
      }
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      alert('Произошла ошибка при добавлении комментария. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Функция для отправки ответа на комментарий
  const submitReply = async (postId, commentId) => {
    if (!newReplyText.trim()) return;
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }
    
    setSubmittingComment(true);
    
    try {
      const response = await commentService.addReply(postId, commentId, currentUser.telegramId, newReplyText);
      
      if (response.success && response.comment) {
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          const commentIndex = postComments.findIndex(c => c.id === commentId);
          
          if (commentIndex !== -1) {
            // Если у комментария уже есть ответы, добавляем к ним
            if (postComments[commentIndex].replies) {
              postComments[commentIndex].replies.push(response.comment);
            } else {
              // Если ответов еще нет, создаем массив с первым ответом
              postComments[commentIndex].replies = [response.comment];
            }
            
            // Увеличиваем счетчик ответов
            postComments[commentIndex].reply_count = (postComments[commentIndex].reply_count || 0) + 1;
          }
          
          return {
            ...prevComments,
            [postId]: postComments
          };
        });
        
        // Увеличиваем счетчик комментариев к посту
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comments: post.comments + 1 
                } 
              : post
          )
        );
        
        // Очищаем поле ввода и сбрасываем состояние ответа
        setNewReplyText('');
        setReplyToComment(null);
      } else {
        throw new Error(response.message || 'Не удалось добавить ответ на комментарий');
      }
    } catch (error) {
      console.error('Ошибка при добавлении ответа на комментарий:', error);
      alert('Произошла ошибка при добавлении ответа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Функция для удаления комментария
  const deleteComment = async (commentId, postId, isReply = false, parentId = null) => {
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }
    
    try {
      const response = await commentService.deleteComment(commentId, currentUser.telegramId);
      
      if (response.success) {
        // Определяем, сколько комментариев было удалено (сам комментарий + ответы)
        const deletedCount = 1 + (response.deleted_replies_count || 0);
        
        if (isReply && parentId) {
          // Если это ответ на комментарий, удаляем его из списка ответов
          setComments(prevComments => {
            const postComments = [...(prevComments[postId] || [])];
            const parentIndex = postComments.findIndex(c => c.id === parentId);
            
            if (parentIndex !== -1 && postComments[parentIndex].replies) {
              // Удаляем ответ из списка
              postComments[parentIndex].replies = postComments[parentIndex].replies.filter(
                reply => reply.id !== commentId
              );
              
              // Уменьшаем счетчик ответов
              postComments[parentIndex].reply_count = Math.max(0, (postComments[parentIndex].reply_count || 0) - 1);
            }
            
            return {
              ...prevComments,
              [postId]: postComments
            };
          });
        } else {
          // Если это основной комментарий, удаляем его из списка
          setComments(prevComments => ({
            ...prevComments,
            [postId]: (prevComments[postId] || []).filter(comment => comment.id !== commentId)
          }));
        }
        
        // Уменьшаем счетчик комментариев к посту
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comments: Math.max(0, post.comments - deletedCount) 
                } 
              : post
          )
        );
      } else {
        throw new Error(response.message || 'Не удалось удалить комментарий');
      }
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      alert('Произошла ошибка при удалении комментария. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Функция для переключения отображения ответов на комментарий
  const toggleReplies = async (postId, commentId) => {
    // Если ответы уже раскрыты, скрываем их
    if (expandedReplies[commentId]) {
      setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
    } else {
      // Иначе загружаем и показываем ответы
      await fetchReplies(postId, commentId);
    }
  };

  // Функция для редактирования комментария
  const handleEditComment = (commentId, postId) => {
    setEditingComment(commentId);
  };

  // Функция для отмены редактирования комментария
  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  // Функция для сохранения отредактированного комментария
  const handleSaveEdit = async (commentId, postId, newContent) => {
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }
    
    try {
      const response = await commentService.updateComment(commentId, currentUser.telegramId, newContent);
      
      if (response.success) {
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          const commentIndex = postComments.findIndex(c => c.id === commentId);
          
          if (commentIndex !== -1) {
            postComments[commentIndex].content = newContent;
            postComments[commentIndex].updated_at = new Date().toISOString();
          }
          
          return {
            ...prevComments,
            [postId]: postComments
          };
        });
        
        // Сбрасываем состояние редактирования
        setEditingComment(null);
      } else {
        throw new Error(response.message || 'Не удалось обновить комментарий');
      }
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
      alert('Произошла ошибка при обновлении комментария. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Функция для лайка комментария 
  const likeComment = async (commentId, postId) => {
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }

    try {
      const response = await commentService.likeComment(commentId, currentUser.telegramId);
      
      if (response.success) {
        // Обновляем состояние комментариев после успешного лайка
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          const updatedComments = postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                has_liked: true,
                like_count: (comment.like_count || 0) + 1
              };
            }
            return comment;
          });
          
          return {
            ...prevComments,
            [postId]: updatedComments
          };
        });
      } else {
        throw new Error(response.message || 'Не удалось поставить лайк комментарию');
      }
    } catch (error) {
      console.error('Ошибка при лайке комментария:', error);
      alert('Произошла ошибка при лайке комментария. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Функция для снятия лайка с комментария
  const unlikeComment = async (commentId, postId) => {
    if (!currentUser.telegramId) {
      alert('Не удалось идентифицировать пользователя Telegram. Пожалуйста, обновите страницу.');
      return;
    }

    try {
      const response = await commentService.unlikeComment(commentId, currentUser.telegramId);
      
      if (response.success) {
        // Обновляем состояние комментариев после успешного снятия лайка
        setComments(prevComments => {
          const postComments = [...(prevComments[postId] || [])];
          const updatedComments = postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                has_liked: false,
                like_count: Math.max((comment.like_count || 0) - 1, 0)
              };
            }
            return comment;
          });
          
          return {
            ...prevComments,
            [postId]: updatedComments
          };
        });
      } else {
        throw new Error(response.message || 'Не удалось убрать лайк комментария');
      }
    } catch (error) {
      console.error('Ошибка при снятии лайка комментария:', error);
      alert('Произошла ошибка при снятии лайка комментария. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Если telegramId еще не получен, показываем загрузку
  if (!currentUser.telegramId && !error) {
    return (
      <div className={styles.container}>
        <NewsHeader activePage="trends" />
        <div className={styles.content}>
          <div className={styles.loadingState}>
            <p>Загрузка данных пользователя...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NewsHeader activePage="trends" />
      
      <div className={styles.content}>
        {/* Форма создания нового поста */}
        <div className={styles.createPostContainer}>
          <div className={styles.postHeader}>
            <div className={styles.postAvatar}>
              <FaUser size={24} color="#666" />
            </div>
            <div className={styles.postForm}>
              <form onSubmit={handleSubmitPost}>
                <textarea 
                  className={styles.postInput}
                  placeholder="Что нового?"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  maxLength={500}
                />
                
                {/* Превью выбранного изображения */}
                {imagePreview && (
                  <div className={styles.imagePreviewContainer}>
                    <img 
                      src={imagePreview} 
                      alt="Предпросмотр" 
                      className={styles.imagePreview} 
                    />
                    <button 
                      type="button" 
                      className={styles.removeImageBtn}
                      onClick={handleRemoveImage}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                
                <div className={styles.postActions}>
                  <div className={styles.postAttachments}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      id="imageInput"
                    />
                    <button 
                      type="button" 
                      className={styles.attachButton}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FaImage />
                    </button>
                    <button type="button" className={styles.attachButton}>
                      <FaVideo />
                    </button>
                    {/* <button type="button" className={styles.attachButton}>
                      <FaSmile />
                    </button> */}
                  </div>
                  <button 
                    type="submit" 
                    className={styles.postSubmit}
                    disabled={isUploading || (!newPostText.trim() && !selectedImage)}
                  >
                    {isUploading ? 'Отправка...' : <FaPaperPlane />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Состояние первоначальной загрузки */}
        {isLoading && (
          <div className={styles.loadingState}>
            <p>Загрузка постов...</p>
          </div>
        )}
        
        {/* Состояние ошибки */}
        {error && (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={fetchPosts}
            >
              Попробовать снова
            </button>
          </div>
        )}
        
        {/* Список постов */}
        {!isLoading && !error && posts.length > 0 ? (
          <div className={styles.postsContainer}>
            {posts.map(post => (
              <div key={post.id} className={styles.post}>
                <div className={styles.postAuthorInfo}>
                  <div className={styles.authorAvatar}>
                    {post.avatar ? (
                      <img src={post.avatar} alt={post.author} />
                    ) : (
                      <FaUser size={20} color="#666" />
                    )}
                  </div>
                  <div className={styles.authorDetails}>
                    <p className={styles.authorName}>{post.author}</p>
                    <p className={styles.postTime}>{formatPostTime(post.timestamp)}</p>
                  </div>
                </div>
                <div className={styles.postContent}>
                  <p className={styles.postText}>{post.text}</p>
                  
                  {/* Отображение изображения поста, если оно есть */}
                  {post.image && (
                    <div className={styles.postImageContainer}>
                      <img 
                        src={post.image} 
                        alt="Изображение поста" 
                        className={styles.postImage} 
                      />
                    </div>
                  )}
                </div>
                <div className={styles.postFooter}>
                  <button 
                    className={`${styles.postAction}`}
                    onClick={() => handleLikeToggle(post.id, post.hasLiked)}
                  >
                    <FaHeart className={post.hasLiked ? styles.heartIconLiked : styles.heartIcon} />
                    {post.likeCount > 0 ? post.likeCount : ''}
                  </button>
                  <button 
                    className={`${styles.postAction}`}
                    onClick={() => toggleComments(post.id)}
                  >
                    <FaComment className={styles.commentIcon} /> {post.comments > 0 ? post.comments : ''}
                  </button>
                  <button className={styles.postAction}>
                    <FaRetweet className={styles.retweetIcon} />
                  </button>
                </div>
                
                {/* Секция комментариев */}
                {expandedComments === post.id && (
                  <div className={styles.commentsSection}>
                    {/* Загрузка комментариев */}
                    {loadingComments ? (
                      <p className={styles.commentsLoading}>Загрузка комментариев...</p>
                    ) : (
                      <>
                        {/* Список комментариев */}
                        {comments[post.id] && comments[post.id].length > 0 ? (
                          <div className={styles.commentsList}>
                            {/* Показываем количество комментариев */}
                            <div className={styles.commentsCount}>
                              {comments[post.id].length > 2 ? (
                                <button 
                                  className={styles.viewAllComments}
                                  onClick={() => setExpandedComments(null)} // Временно просто закрываем комментарии
                                >
                                  Просмотреть все комментарии ({comments[post.id].length})
                                </button>
                              ) : (
                                <span className={styles.commentsCounter}>{comments[post.id].length} комментариев</span>
                              )}
                            </div>

                            {/* Показываем комментарии */}
                            {comments[post.id].map(comment => (
                              <div key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentMain}>
                                  <span className={styles.commentAuthorName}>
                                    {comment.first_name || 'Пользователь'}
                                  </span>
                                  <span className={styles.commentText}>
                                    {comment.content}
                                  </span>
                                </div>
                                
                                <div className={styles.commentActions}>
                                  <span className={styles.commentTime}>
                                    {formatPostTime(comment.created_at)}
                                  </span>
                                  
                                  <button 
                                    className={styles.replyButton}
                                    onClick={() => {
                                      setReplyToComment(replyToComment === comment.id ? null : comment.id);
                                      setNewReplyText('');
                                    }}
                                  >
                                    Ответить
                                  </button>
                                  
                                  <button 
                                    className={`${styles.likeButton} ${comment.has_liked ? styles.liked : ''}`}
                                    onClick={() => comment.has_liked 
                                      ? unlikeComment(comment.id, post.id) 
                                      : likeComment(comment.id, post.id)
                                    }
                                  >
                                    ♥ {comment.like_count > 0 && comment.like_count}
                                  </button>
                                  
                                  {comment.telegram_id === currentUser.telegramId && (
                                    <button 
                                      className={styles.deleteCommentBtn}
                                      onClick={() => deleteComment(comment.id, post.id)}
                                    >
                                      Удалить
                                    </button>
                                  )}
                                </div>
                                
                                {/* Форма для ответа на комментарий */}
                                {replyToComment === comment.id && (
                                  <div className={styles.replyForm}>
                                    <input
                                      type="text"
                                      className={styles.replyInput}
                                      placeholder="Напишите ответ..."
                                      value={newReplyText}
                                      onChange={(e) => setNewReplyText(e.target.value)}
                                    />
                                    <div className={styles.replyFormActions}>
                                      <button 
                                        className={styles.cancelReplyBtn}
                                        onClick={() => {
                                          setReplyToComment(null);
                                          setNewReplyText('');
                                        }}
                                      >
                                        Отмена
                                      </button>
                                      <button 
                                        className={styles.submitReplyBtn}
                                        onClick={() => submitReply(post.id, comment.id)}
                                        disabled={!newReplyText.trim() || submittingComment}
                                      >
                                        {submittingComment ? '...' : 'Ответить'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Ответы на комментарий */}
                                {comment.reply_count > 0 && (
                                  <div className={styles.repliesInfo}>
                                    <button 
                                      className={styles.viewRepliesButton}
                                      onClick={() => toggleReplies(post.id, comment.id)}
                                    >
                                      {expandedReplies[comment.id] 
                                        ? 'Скрыть ответы'
                                        : `Показать ответы (${comment.reply_count})`}
                                    </button>
                                    
                                    {expandedReplies[comment.id] && comment.replies && (
                                      <div className={styles.repliesList}>
                                        {loadingReplies[comment.id] ? (
                                          <p className={styles.repliesLoading}>Загрузка ответов...</p>
                                        ) : (
                                          comment.replies.map(reply => (
                                            <div key={reply.id} className={styles.replyItem}>
                                              <div className={styles.commentMain}>
                                                <span className={styles.commentAuthorName}>
                                                  {reply.first_name || 'Пользователь'}
                                                </span>
                                                <span className={styles.commentText}>
                                                  {reply.content}
                                                </span>
                                              </div>
                                              <div className={styles.commentActions}>
                                                <span className={styles.commentTime}>
                                                  {formatPostTime(reply.created_at)}
                                                </span>
                                                
                                                <button 
                                                  className={`${styles.likeButton} ${reply.has_liked ? styles.liked : ''}`}
                                                  onClick={() => reply.has_liked 
                                                    ? unlikeComment(reply.id, post.id) 
                                                    : likeComment(reply.id, post.id)
                                                  }
                                                >
                                                  ♥ {reply.like_count > 0 && reply.like_count}
                                                </button>
                                                
                                                {reply.telegram_id === currentUser.telegramId && (
                                                  <button 
                                                    className={styles.deleteCommentBtn}
                                                    onClick={() => deleteComment(reply.id, post.id, true, comment.id)}
                                                  >
                                                    Удалить
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.noComments}>Еще нет комментариев. Будьте первым!</p>
                        )}
                                                
                        {/* Форма добавления нового комментария */}
                        <div className={styles.addCommentForm}>
                          <input
                            type="text"
                            className={styles.commentInput}
                            placeholder="Добавить комментарий..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            ref={commentInputRef}
                          />
                          <button 
                            className={styles.postCommentBtn}
                            onClick={() => submitComment(post.id)}
                            disabled={!newCommentText.trim() || submittingComment}
                          >
                            {submittingComment ? '...' : 'Опубликовать'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Элемент для отслеживания прокрутки и загрузки дополнительных постов */}
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className={styles.loadMoreTrigger}
              >
                {isLoadingMore && <p className={styles.loadingMoreText}>Загрузка дополнительных постов...</p>}
              </div>
            )}
          </div>
        ) : !isLoading && !error ? (
          <div className={styles.emptyState}>
            <h2>Ничего нет</h2>
            <p>Будьте первым, кто опубликует сообщение в тренды</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrendsPage; 