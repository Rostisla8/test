import React from 'react';
import styles from './NewsHeader.module.css';

const NewsHeader = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Новости Бреста</h1>
      <p className={styles.subtitle}>Актуальные события города</p>
    </div>
  );
};

export default NewsHeader; 