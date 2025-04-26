import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cx21729.tw1.ru';

const commentService = {
  // Получить комментарии к посту
  async getComments(postId, limit = 50, offset = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments?post_id=${postId}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении комментариев:', error);
      throw error;
    }
  },

  // Получить ответы на комментарий
  async getReplies(postId, commentId, limit = 50, offset = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments?post_id=${postId}&parent_id=${commentId}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении ответов на комментарий:', error);
      throw error;
    }
  },

  // Добавить новый комментарий к посту
  async addComment(postId, telegramId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          post_id: postId,
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      throw error;
    }
  },

  // Добавить ответ на комментарий
  async addReply(postId, commentId, telegramId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          post_id: postId,
          parent_id: commentId,
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при добавлении ответа на комментарий:', error);
      throw error;
    }
  },

  // Удалить комментарий
  async deleteComment(commentId, telegramId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments?comment_id=${commentId}&telegram_id=${telegramId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      throw error;
    }
  },

  // Обновить комментарий (этот метод может потребоваться в будущем)
  async updateComment(commentId, telegramId, content) {
    try {
      // Примечание: API для обновления комментария не было предоставлено
      // Это примерная реализация, которую нужно будет изменить, когда появится соответствующий API
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_id: commentId,
          telegram_id: telegramId,
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
      throw error;
    }
  },

  // Лайкнуть комментарий
  async likeComment(commentId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при лайке комментария:', error);
      throw error;
    }
  },

  // Убрать лайк с комментария
  async unlikeComment(commentId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении лайка комментария:', error);
      throw error;
    }
  }
};

export default commentService; 