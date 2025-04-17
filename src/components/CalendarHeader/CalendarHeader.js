import React from 'react';
import styles from './CalendarHeader.module.css';

const getDayOfWeek = (date) => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
};

const getMonthName = (date) => {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months[date.getMonth()];
};

const CalendarHeader = ({ date, isToday }) => {
  return (
    <div className={styles.calendarHeader}>
      <div className={styles.dateWrapper}>
        <div className={styles.date}>
          <span className={styles.dayNumber}>{date.getDate()}</span>
          <div className={styles.monthInfo}>
            <span className={styles.dayOfWeek}>{getDayOfWeek(date)}</span>
            <span className={styles.month}>{getMonthName(date)} {date.getFullYear()}</span>
          </div>
        </div>
        {isToday && <div className={styles.todayTag}>Сегодня</div>}
      </div>
    </div>
  );
};

export default CalendarHeader; 