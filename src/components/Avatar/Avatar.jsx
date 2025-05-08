import React from 'react';
import { FaUser } from 'react-icons/fa';
import styles from './Avatar.module.css';

/**
 * Компонент аватара пользователя
 * @param {Object} props - Свойства компонента
 * @param {string} [props.src] - URL изображения аватара
 * @param {string} [props.alt] - Альтернативный текст для изображения
 * @param {string} [props.size] - Размер аватара: 'small', 'medium' (по умолчанию), 'large'
 * @param {string} [props.className] - Дополнительный CSS-класс
 */
const Avatar = ({ src, alt = 'User', size = 'medium', className = '' }) => {
  const sizeClass = styles[size] || styles.medium;
  
  return (
    <div className={`${styles.avatar} ${sizeClass} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <div className={styles.placeholder}>
          <FaUser className={styles.icon} />
        </div>
      )}
    </div>
  );
};

export default Avatar; 