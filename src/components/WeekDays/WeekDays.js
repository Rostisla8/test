import React from 'react';
import { format } from 'date-fns'; // Импортируем format
import styles from './WeekDays.module.css';

// Добавляем значение по умолчанию для availableDates
const WeekDays = ({ selectedDate, onDateSelect, availableDates = new Set() }) => { 
  // Получаем текущую дату
  const currentDate = new Date(selectedDate);
  
  // Получаем начало недели (воскресенье)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  // Создаем массив дат для всей недели (7 дней)
  const weekDays = Array(7).fill().map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Короткие названия дней недели
  const dayLabels = ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'];
  
  return (
    <div className={styles.weekDays}>
      {weekDays.map((day, index) => {
        const isSelected = day.getDate() === selectedDate.getDate() && 
                           day.getMonth() === selectedDate.getMonth() &&
                           day.getFullYear() === selectedDate.getFullYear();
                           
        // Проверяем, доступна ли дата
        const dayString = format(day, 'yyyy-MM-dd');
        const isAvailable = availableDates.has(dayString);
                           
        return (
          <div 
            key={index}
            className={
              `${styles.day} 
               ${isSelected ? styles.selected : ''} 
               ${!isAvailable ? styles.disabled : ''}` // Добавляем класс для недоступных
            }
            onClick={() => isAvailable && onDateSelect(day)} // Вызываем onDateSelect только если дата доступна
          >
            <div className={styles.dayLabel}>{dayLabels[index]}</div>
            <div className={styles.dayNumber}>{day.getDate()}</div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekDays; 