import React, { useState, useEffect } from 'react';
import styles from './NewsPage.module.css';
import NewsHeader from '../../components/NewsHeader/NewsHeader';
import NewsCard from '../../components/NewsCard/NewsCard';

// API ключ для newsdata.io
const NEWS_API_KEY = 'pub_8074032e908be4d3135488e89aa341384312f';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const userData = {
        telegram_id: 123456789,
        first_name: "Тестовый",
        last_name: "Пользователь",
        username: "test_user",
        photo_url: "https://avatars.githubusercontent.com/test_user?s=200",
        auth_date: 16312344444567,
        hash: "test_hash"
      };
      
      // Функция для отправки запроса
      async function testUserApi() {
        try {
          console.log('Отправляем запрос на сервер...');
          
          const response = await fetch('https://cw17922.tw1.ru/api/users.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
          
          const data = await response.json();
          console.log('Ответ от сервера:');
          console.log(JSON.stringify(data, null, 2));
          
          return data;
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      }
      
      // Запускаем тест
      testUserApi();

      setLoading(true);
      setError(null);
      
      try {
        // Запрос новостей через newsdata.io API
        // Параметры: q=Брест для поиска новостей о Бресте, language=ru для русскоязычных новостей
        const response = await fetch(
          `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&country=by&language=ru&q=Брест`
        );
        
        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.results) {
          setNews(data.results);
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Ошибка при получении новостей:', err);
        setError('Не удалось загрузить новости. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // Обработка статуса загрузки и ошибок
  if (loading) {
    return (
      <div className={styles.container}>
        <NewsHeader activePage="news" />
        <div className={styles.status}>Загрузка новостей...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <NewsHeader activePage="news" />
        <div className={styles.error}>{error}</div>
      </div>
    );
  }
  
  if (news.length === 0) {
    return (
      <div className={styles.container}>
        <NewsHeader activePage="news" />
        <div className={styles.noNews}>Новости не найдены</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NewsHeader activePage="news" />
      
      <div className={styles.newsList}>
        {news.map((item, index) => (
          <NewsCard
            key={item.article_id || index}
            title={item.title}
            description={item.description}
            source={item.source_id}
            pubDate={item.pubDate}
            imageUrl={item.image_url}
            link={item.link}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsPage; 