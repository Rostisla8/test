import React, { useState, useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaCamera, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaTelegram } from 'react-icons/fa';
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

  // Состояние для проверки доступности Telegram API
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли объект window.Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      setIsTelegramAvailable(true);
      
      // Получаем данные пользователя из Telegram WebApp
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      
      if (tgUser) {
        // Формируем URL аватара используя ID пользователя Telegram
        // Telegram API предоставляет аватары по пути https://t.me/i/userpic/320/{userId}.jpg
        const avatarUrl = tgUser.id ? `https://avatars.githubusercontent.com/${tgUser.username}?s=200` : null;
        
        setUser({
          name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
          username: tgUser.username ? `@${tgUser.username}` : '',
          email: '', // Telegram API не предоставляет email
          phone: '', // Telegram API не предоставляет телефон
          location: 'Брест, Беларусь', // Местоположение можно запросить отдельно, если требуется
          avatar: avatarUrl,
          telegramId: tgUser.id
        });
      } else {
        // Тестовые данные, если не удалось получить данные из Telegram
        setUser({
          name: 'Пользователь Telegram',
          username: '@user',
          email: 'user@telegram.org',
          phone: '+375 29 XXX XX XX',
          location: 'Брест, Беларусь',
          avatar: null,
          telegramId: null
        });
      }
    } else {
      console.log('Telegram WebApp API не доступен, используем тестовые данные');
      // Тестовые данные для разработки вне Telegram
      setUser({
        name: 'Иван Иванов',
        username: '@ivanov',
        email: 'ivan@example.com',
        phone: '+375 29 123 45 67',
        location: 'Брест, Беларусь',
        avatar: 'https://i.pravatar.cc/300',
        telegramId: null
      });
    }
  }, []);

  // Функция для закрытия приложения Telegram
  const handleCloseApp = () => {
    if (isTelegramAvailable && window.Telegram.WebApp) {
      // Закрываем приложение Telegram
      window.Telegram.WebApp.close();
    } else {
      alert('Функция доступна только в Telegram Mini App');
    }
  };

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
          <button className={styles.cameraButton}>
            <FaCamera size={16} color="#fff" />
          </button>
        </div>
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
      
      {/* Настройки и функции */}
      <div className={styles.settingsSection}>
        <button className={styles.settingsButton}>
          <FaCog className={styles.buttonIcon} />
          <span>Настройки</span>
        </button>
        
        <button className={styles.logoutButton} onClick={handleCloseApp}>
          <FaSignOutAlt className={styles.buttonIcon} />
          <span>Закрыть приложение</span>
        </button>
      </div>
      
      {/* Раздел "В разработке" */}
      <div className={styles.developmentNote}>
        <p>Дополнительные функции в разработке</p>
      </div>
    </div>
  );
};

export default ProfilePage; 