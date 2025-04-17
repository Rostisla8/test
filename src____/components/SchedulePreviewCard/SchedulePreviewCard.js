import React from 'react';
import styles from './SchedulePreviewCard.module.css';
import { FaEllipsisH } from 'react-icons/fa';

// Принимаем пропсы: subject, chapter, room, teacher
const SchedulePreviewCard = ({ subject, chapter, color }) => {
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div className={styles.content}>
        <h3 className={styles.subject}>{subject}</h3>
        <p className={styles.chapter}>{chapter}</p>
        {/* Можно добавить детали (комната, учитель), если нужно */}
      </div>
      <button className={styles.menuButton}>
        <FaEllipsisH size={16} color="#ffffff" />
      </button>
      {/* Декоративный элемент (волна) будет добавлен через CSS */}
    </div>
  );
};

export default SchedulePreviewCard; 