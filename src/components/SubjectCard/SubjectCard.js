import React from 'react';
import styles from './SubjectCard.module.css';
import { FaEllipsisH } from 'react-icons/fa'; // Иконка троеточия

// Принимаем пропсы: title, icon, color, rate и onRemove
const SubjectCard = ({ title, icon, color, rate, onRemove }) => {
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          {/* Иконка валюты */}
          {icon ? icon : <span className={styles.defaultIcon}>?</span>}
        </div>
        {/* Вызываем onRemove при клике */} 
        <button className={styles.menuButton} onClick={onRemove} title="Удалить карточку">
          <FaEllipsisH size={16} color="#ffffff" />
        </button>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{title}</h3>
        {/* Отображаем курс, если он передан */} 
        {rate && <p className={styles.rateText}>{rate}</p>}
      </div>
    </div>
  );
};

export default SubjectCard; 