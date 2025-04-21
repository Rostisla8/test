import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaComment, FaUser } from 'react-icons/fa'; // Пример иконок
import styles from './BottomNav.module.css';

const BottomNav = () => {
  // Функция для определения класса активной/неактивной ссылки
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;
  };

  return (
    <nav className={styles.bottomNav}>
      <NavLink to="/" className={getNavLinkClass} end>
        <FaHome size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/schedule" className={getNavLinkClass}>
        <FaCalendarAlt size={20} />
        <span>Schedule</span>
      </NavLink>
      {/* Заглушка для чата */}
      <button className={styles.navItem} disabled>
        <FaComment size={20} />
        <span>Chat</span>
      </button>
      {/* Активная ссылка на профиль */}
      <NavLink to="/profile" className={getNavLinkClass}>
        <FaUser size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav; 