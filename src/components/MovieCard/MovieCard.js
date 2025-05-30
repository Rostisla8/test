import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import styles from './MovieCard.module.css';

// Принимает объект фильма со сгруппированными сеансами, флаг isExpanded и обработчик onToggleExpand
const MovieCard = ({ movieGroup, isExpanded, onToggleExpand, onToggleFavorite, favorites = [] }) => {
  // Добавляем проверку на случай, если movieGroup все же undefined
  if (!movieGroup || !movieGroup.movieData || !movieGroup.theaters) {
    // Можно вернуть null или какой-то placeholder/сообщение об ошибке
    console.warn('MovieCard получил некорректные данные:', movieGroup);
    return null; 
  }

  const { movieData, theaters } = movieGroup;
  const fullImageUrl = movieData.image ? `https://kinobrest.by${movieData.image}` : null;
  
  // Проверяем, находится ли фильм в избранном
  const isFavorite = favorites.some(fav => fav.title === movieData.title);

  return (
    // Оборачиваем всю карточку в div с onClick для раскрытия
    <div className={styles.card} onClick={() => onToggleExpand(movieData.title)}>
      <div className={styles.movieInfo}>
        {/* Верхняя часть (всегда видима) */}
        <div className={styles.header}>
          <h3 className={styles.title}>{movieData.title}</h3>
          {/* Предотвращаем всплытие клика с кнопки звезды до карточки */}
          <button 
            className={`${styles.favoriteButton} ${isFavorite ? styles.favorite : ''}`}
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"} 
            onClick={(e) => { 
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(movieData);
            }}
          >
            <FaStar color={isFavorite ? '#FFD700' : '#888'} />
          </button>
        </div>

        {/* Детали, которые видны всегда */}
        <div className={styles.alwaysVisibleDetails}>
          {movieData.additional_info?.duration && (
            <div className={styles.detailItem}> 
              <FaClock />
              <span>{movieData.additional_info.duration}</span>
            </div>
          )}
          {movieData.additional_info?.director && (
            <p className={styles.director}> 
              Режиссер: {movieData.additional_info.director}
            </p>
          )}
        </div>

        {/* Раскрывающаяся часть */} 
        <div className={`${styles.expandableContent} ${isExpanded ? styles.expanded : ''}`}>
          {fullImageUrl && (
            <img src={fullImageUrl} alt={`Постер ${movieData.title}`} className={styles.movieImage} />
          )}
          {movieData.additional_info?.description && (
            <p className={styles.description}>{movieData.additional_info.description}</p>
          )}
        </div>
        
        {/* Список кинотеатров и сеансов (всегда видим) */} 
        <div className={styles.details}>
          {theaters.map((theater) => (
            <div key={theater.name} className={styles.theaterGroup}>
              <div className={styles.theaterName}>
                <FaMapMarkerAlt />
                <span>{theater.name}</span>
              </div>
              <div className={styles.showtimes}>
                {theater.showtimes.map((time) => (
                  <span key={time} className={styles.showtimeChip}>{time}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 