import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './DateScroller.module.css';

const DateScroller = ({ availableDates, selectedDate, onDateSelect }) => {
  const scrollerRef = useRef(null);
  const selectedRef = useRef(null);

  // Прокрутка к выбранному элементу при монтировании или изменении selectedDate
  useEffect(() => {
    if (selectedRef.current && scrollerRef.current) {
      const scroller = scrollerRef.current;
      const selectedElement = selectedRef.current;
      // Центрируем выбранный элемент
      const scrollLeft = selectedElement.offsetLeft + selectedElement.offsetWidth / 2 - scroller.offsetWidth / 2;
      scroller.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]); // Зависимость от selectedDate

  return (
    <div className={styles.scrollerContainer} ref={scrollerRef}>
      {availableDates.map((date, index) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        return (
          <div 
            key={index}
            ref={isSelected ? selectedRef : null} // Добавляем ref для выбранного элемента
            className={`${styles.dateItem} ${isSelected ? styles.selected : ''}`}
            onClick={() => onDateSelect(date)}
          >
            {/* Отображаем день недели и число */}
            <div className={styles.dayLabel}>{format(date, 'E', { locale: ru }).toUpperCase()}</div>
            <div className={styles.dayNumber}>{format(date, 'd')}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DateScroller; 