import React from 'react';
import { FaBars } from 'react-icons/fa';
import styles from './ScheduleHeader.module.css';

const ScheduleHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.time}>Время</div>
      <div className={styles.movie}>Фильм</div>
      <button className={styles.menuButton}>
        <FaBars />
      </button>
    </div>
  );
};

export default ScheduleHeader; 