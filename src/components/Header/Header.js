import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './Header.module.css';

// Позже можно добавить пропс для динамического заголовка, если нужно
const Header = () => {
  return (
    <div className={styles.header}>
      {/* Фоновое изображение/градиент будет добавлено через CSS */}
      <div className={styles.content}>
        {/* Иконка поиска */}
        <button className={styles.searchButton}>
          <FaSearch size={18} color="#ffffff" />
        </button>
        {/* Можно добавить другие элементы, если нужно */}
        {/* Пример: Заголовок */}
        {/* <h1 className={styles.title}>Discover</h1> */}
      </div>
      {/* Элемент для скругленного нижнего края, если нужно имитировать картинку */}
      {/* <div className={styles.curve}></div> */}
    </div>
  );
};

export default Header; 