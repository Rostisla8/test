import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './Header.module.css';
import { ReactComponent as HeaderLogo } from '../../HeaderLogo.svg';
//testir
// Позже можно добавить пропс для динамического заголовка, если нужно
const Header = () => {
  return (
    <div className={styles.header}>
      {/* Поисковая иконка в верхнем правом углу */}
      <button className={styles.searchButton}>
        <FaSearch size={18} color="#ffffff" />
      </button>
      
      {/* Центральный контейнер с логотипом и названием */}
      <div className={styles.mainContainer}>
        <div className={styles.logoContainer}>
          <HeaderLogo className={styles.logo} />
          <h1 className={styles.logoText}>BrestHub</h1>
        </div>
      </div>
      {/* Элемент для скругленного нижнего края, если нужно имитировать картинку */}
      {/* <div className={styles.curve}></div> */}
    </div>
  );
};

export default Header; 