import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NewsHeader.module.css';

const NewsHeader = ({ activePage = 'news' }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Новости Бреста</h1>
        <p className={styles.subtitle}>Актуальные события города</p>
      </div>
      
      <div className={styles.tabsContainer}>
        <Link 
          to="/news" 
          className={`${styles.tab} ${activePage === 'news' ? styles.activeTab : ''}`}
        >
          Новости
        </Link>
        <Link 
          to="/trends" 
          className={`${styles.tab} ${activePage === 'trends' ? styles.activeTab : ''}`}
        >
          Тренды
        </Link>
      </div>
    </div>
  );
};

export default NewsHeader; 