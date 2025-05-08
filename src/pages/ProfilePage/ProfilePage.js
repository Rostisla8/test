/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaCamera, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaTelegram } from 'react-icons/fa';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  // Состояние для хранения данных пользователя Telegram
  const [user, setUser] = useState({
    name: 'Загрузка...',
    username: '',
    email: '',
    phone: '',
    location: 'Брест, Беларусь',
    avatar: null,
    telegramId: null
  });
  
  // Состояние для хранения ответа API
  const [apiResponse, setApiResponse] = useState(null);
  
  // Состояние для проверки доступности Telegram API
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);
  
  // Состояния для обработки загрузки фото - закомментировано, так как мы используем аватар из API
  // const [isLoading, setIsLoading] = useState(false);
  // const [uploadMessage, setUploadMessage] = useState('');
  
  // Ссылка на скрытый input для выбора файла - закомментировано, так как мы не используем загрузку файлов
  // const fileInputRef = useRef(null);

  // Функция для отправки данных пользователя на сервер
  const sendUserDataToServer = async (userData) => {
    try {
      console.log('Отправляем запрос на сервер...');
      console.log('Данные для отправки:', userData);
      
      const response = await fetch('https://cy35179.tw1.ru/api/users.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Ответ от сервера:');
      console.log(JSON.stringify(data, null, 2));
      
      setApiResponse(data);
      return data;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setApiResponse({ error: error.message });
      return null;
    }
  };

  // Инициализация данных из Telegram при монтировании компонента
  useEffect(() => {
    const initTelegramData = () => {
      // Проверяем доступен ли Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        setIsTelegramAvailable(true);
        
        // Получаем данные пользователя из Telegram
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        
        if (tgUser) {
          // Формируем URL аватара
          const avatarUrl = tgUser.photo_url || (tgUser.username ? `https://avatars.githubusercontent.com/${tgUser.username}?s=200` : null);
          
          // Обновляем состояние пользователя
          setUser({
            name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
            username: tgUser.username ? `@${tgUser.username}` : '',
            email: '', // Telegram не предоставляет email
            phone: '', // Telegram не предоставляет телефон
            location: 'Брест, Беларусь',
            avatar: avatarUrl,
            telegramId: tgUser.id
          });
          
          // Подготовка данных для отправки на сервер
          const userDataForApi = {
            telegram_id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name || null,
            username: tgUser.username || null,
            photo_url: avatarUrl,
            auth_date: Math.floor(Date.now() / 1000),
            hash: window.Telegram.WebApp.initDataUnsafe?.hash || 'development_hash'
          };
          
          // Отправляем данные на сервер
          sendUserDataToServer(userDataForApi);
        } else {
          // Если приложение запущено вне Telegram или данные недоступны
          console.log('Пользовательские данные из Telegram недоступны. Используем тестовые данные.');
          
          // Тестовые данные для отправки на сервер
          const testUserData = {
            telegram_id: 123456789,
            first_name: "Тестовый",
            last_name: "Пользователь",
            username: "test_user",
            photo_url: "https://avatars.githubusercontent.com/test_user?s=200",
            auth_date: Math.floor(Date.now() / 1000),
            hash: "test_hash"
          };
          
          setUser({
            name: `${testUserData.first_name} ${testUserData.last_name}`,
            username: `@${testUserData.username}`,
            email: '',
            phone: '',
            location: 'Брест, Беларусь',
            avatar: testUserData.photo_url,
            telegramId: testUserData.telegram_id
          });
          
          // Отправляем тестовые данные на сервер
          sendUserDataToServer(testUserData);
        }
      } else {
        // Тестовые данные для разработки вне Telegram
        console.log('Telegram WebApp недоступен. Используем тестовые данные.');
        
        // Тестовые данные для отправки на сервер
        const testUserData = {
          telegram_id: 123456789,
          first_name: "Тестовый",
          last_name: "Пользователь",
          username: "test_user",
          photo_url: "https://avatars.githubusercontent.com/test_user?s=200",
          auth_date: Math.floor(Date.now() / 1000),
          hash: "test_hash"
        };
        
        setUser({
          name: `${testUserData.first_name} ${testUserData.last_name}`,
          username: `@${testUserData.username}`,
          email: 'test@example.com',
          phone: '+375 29 123 45 67',
          location: 'Брест, Беларусь',
          avatar: testUserData.photo_url,
          telegramId: testUserData.telegram_id
        });
        
        // Отправляем тестовые данные на сервер
        sendUserDataToServer(testUserData);
      }
    };
    
    initTelegramData();
  }, []);

  // Закомментируем загрузку сохраненного аватара из localStorage, так как мы будем использовать только аватар из API
  /*
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar && !user.avatar) {
        setUser(prevUser => ({
          ...prevUser,
          avatar: savedAvatar
        }));
      }
    } catch (e) {
      console.error('Ошибка при загрузке аватара из localStorage:', e);
    }
  }, [user.avatar]);
  */

  // Функция для закрытия приложения Telegram
  const handleCloseApp = () => {
    try {
      if (isTelegramAvailable && window.Telegram && window.Telegram.WebApp) {
        if (typeof window.Telegram.WebApp.close === 'function') {
          window.Telegram.WebApp.close();
        } else {
          alert('Не удалось закрыть приложение автоматически. Пожалуйста, закройте его вручную.');
        }
      } else {
        alert('Функция доступна только в Telegram Mini App');
      }
    } catch (error) {
      console.error('Ошибка при закрытии приложения:', error);
      alert('Произошла ошибка при закрытии приложения');
    }
  };

  // Закомментируем функции для работы с загрузкой файлов, так как мы не будем их использовать
  /*
  // Функция для открытия диалога выбора файла
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Функция для обработки выбранного файла
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Пожалуйста, выберите изображение');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }
    
    // Ограничение размера файла (5 МБ)
    const maxSize = 5 * 1024 * 1024; // 5 МБ в байтах
    if (file.size > maxSize) {
      setUploadMessage('Размер файла не должен превышать 5 МБ');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }
    
    // Показываем индикатор загрузки
    setIsLoading(true);
    setUploadMessage('Загрузка фото...');
    
    // Преобразуем файл в base64 для хранения в localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      
      // Обновляем аватар пользователя
      setUser(prevUser => ({
        ...prevUser,
        avatar: base64Image
      }));
      
      // Сохраняем аватар в localStorage
      try {
        localStorage.setItem('userAvatar', base64Image);
        setUploadMessage('Фото успешно загружено!');
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (e) {
        console.error('Ошибка при сохранении аватара:', e);
        setUploadMessage('Ошибка при сохранении фото');
        setTimeout(() => setUploadMessage(''), 3000);
      }
      
      // Скрываем индикатор загрузки
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      console.error('Ошибка чтения файла');
      setUploadMessage('Не удалось загрузить изображение. Пожалуйста, попробуйте еще раз.');
      setTimeout(() => setUploadMessage(''), 3000);
      setIsLoading(false);
    };
    
    // Читаем файл как Data URL (base64)
    reader.readAsDataURL(file);
  };
  */

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.pageTitle}>Профиль</h1>
      
      {/* Секция с аватаром пользователя */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="Аватар пользователя" 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.defaultAvatar}>
              <FaUser size={50} color="#666" />
            </div>
          )}
          {/* Убираем кнопку загрузки аватара и input для выбора файла */}
        </div>
        
        {/* Убираем сообщение о загрузке или ошибке */}
        
        <h2 className={styles.userName}>{user.name}</h2>
        {user.username && (
          <p className={styles.userUsername}>{user.username}</p>
        )}
        {user.telegramId && (
          <p className={styles.userTelegramId}>ID: {user.telegramId}</p>
        )}
      </div>
      
      {/* Информация пользователя */}
      <div className={styles.userInfoSection}>
        {isTelegramAvailable && (
          <div className={styles.infoItem}>
            <FaTelegram className={`${styles.infoIcon} ${styles.telegramIcon}`} />
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Telegram</p>
              <p className={styles.infoValue}>Подключено</p>
            </div>
          </div>
        )}
        
        {user.email && (
          <div className={styles.infoItem}>
            <FaEnvelope className={styles.infoIcon} />
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Электронная почта</p>
              <p className={styles.infoValue}>{user.email}</p>
            </div>
          </div>
        )}
        
        {user.phone && (
          <div className={styles.infoItem}>
            <FaPhoneAlt className={styles.infoIcon} />
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Телефон</p>
              <p className={styles.infoValue}>{user.phone}</p>
            </div>
          </div>
        )}
        
        <div className={styles.infoItem}>
          <FaMapMarkerAlt className={styles.infoIcon} />
          <div className={styles.infoText}>
            <p className={styles.infoLabel}>Местоположение</p>
            <p className={styles.infoValue}>{user.location}</p>
          </div>
        </div>
      </div>
      
      {/* Отображение ответа API (для отладки) */}
      {apiResponse && (
        <div className={styles.apiResponseSection}>
          <div className={styles.infoItem}>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Статус API-запроса</p>
              <p className={styles.infoValue}>
                {apiResponse.error 
                  ? `Ошибка: ${apiResponse.error}` 
                  : apiResponse.success 
                    ? 'Успешно' 
                    : 'Получен ответ от сервера'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Кнопка закрытия приложения */}
      <div className={styles.settingsSection}>
        <button className={styles.logoutButton} onClick={handleCloseApp}>
          <FaSignOutAlt className={styles.buttonIcon} />
          <span>Закрыть приложение</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 