import React from 'react';
import { FaHome, FaCalendarAlt, FaCommentDots, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './BottomNavigation.module.css';

const BottomNavigation = ({ activeTab = 'schedule' }) => {
  return (
    <div className={styles.navigation}>
      <Link to="/" className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}>
        <FaHome size={20} />
      </Link>
      <Link to="/schedule" className={`${styles.navItem} ${activeTab === 'schedule' ? styles.active : ''}`}>
        <FaCalendarAlt size={20} />
      </Link>
      <Link to="/chat" className={`${styles.navItem} ${activeTab === 'chat' ? styles.active : ''}`}>
        <FaCommentDots size={20} />
      </Link>
      <Link to="/profile" className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}>
        <FaUser size={20} />
      </Link>
    </div>
  );
};

export default BottomNavigation; 