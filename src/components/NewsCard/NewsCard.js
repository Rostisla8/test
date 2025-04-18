import React from 'react';
import styles from './NewsCard.module.css';

const NewsCard = ({ title, description, source, pubDate, imageUrl, link }) => {
  const handleCardClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Форматирование даты 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  return (
    <div className={styles.newsCard} onClick={handleCardClick}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img 
            src={imageUrl} 
            alt={title} 
            className={styles.newsImage} 
            onError={(e) => {e.target.style.display = 'none'}}
          />
        </div>
      )}
      <div className={styles.contentContainer}>
        <h3 className={styles.newsTitle}>{title}</h3>
        {description && <p className={styles.newsDescription}>{description}</p>}
        <div className={styles.newsFooter}>
          {source && <span className={styles.newsSource}>{source}</span>}
          {pubDate && <span className={styles.newsDate}>{formatDate(pubDate)}</span>}
        </div>
      </div>
    </div>
  );
};

export default NewsCard; 