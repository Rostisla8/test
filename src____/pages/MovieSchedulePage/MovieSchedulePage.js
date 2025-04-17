import React, { useState, useEffect } from 'react';
import { format, addMinutes, differenceInMinutes, parseISO, parse, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './MovieSchedulePage.module.css';
import CalendarHeader from '../../components/CalendarHeader/CalendarHeader';
import DateScroller from '../../components/DateScroller/DateScroller';
import MovieCard from '../../components/MovieCard/MovieCard';

// --- Вспомогательные функции для дат ---
const russianMonths = [
  'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
  'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

// Форматируем дату в строку "dd MMMM yyyy" (на русском)
const formatDateRussian = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = russianMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Парсим строку "dd MMMM yyyy" (на русском) в Date
const parseDateRussian = (dateString) => {
  const parts = dateString.split(' ');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const monthIndex = russianMonths.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || monthIndex === -1 || isNaN(year)) return null;

  const date = new Date(year, monthIndex, day);
  // Проверяем, что дата валидна (например, 31 Февраля не пройдет)
  return isValid(date) && date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day ? date : null;
};

const MovieSchedulePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState(new Set()); // Оставляем Set для быстрой проверки в WeekDays (пока не заменили)
  const [availableDateObjects, setAvailableDateObjects] = useState([]); // Массив объектов Date для нового скроллера
  const [expandedMovieTitle, setExpandedMovieTitle] = useState(null); // Состояние для раскрытой карточки
  
  // Рассчитать конечное время фильма
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return null;
    
    // Извлекаем минуты из строки вроде "90 мин."
    const durationMatch = duration.match(/(\d+)/);
    if (!durationMatch) return null;
    
    const durationMinutes = parseInt(durationMatch[1], 10);
    if (isNaN(durationMinutes)) return null;
    
    return addMinutes(startTime, durationMinutes);
  };

  // Загрузка данных о фильмах и извлечение дат
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://test.akshome.by/test2/$movies.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data);
        
        // Извлекаем все доступные даты из show_times
        const datesSet = new Set(); // Для проверки в старом WeekDays
        const dateObjectsMap = new Map(); // Используем Map для уникальности Date объектов по YYYY-MM-DD
        
        data.forEach(movie => {
          if (movie.additional_info?.show_times) {
            Object.keys(movie.additional_info.show_times).forEach(dateString => {
              const parsedDate = parseDateRussian(dateString);
              if (parsedDate) {
                const dateKey = format(parsedDate, 'yyyy-MM-dd');
                datesSet.add(dateKey);
                if (!dateObjectsMap.has(dateKey)) {
                    dateObjectsMap.set(dateKey, parsedDate);
                }
              }
            });
          }
        });
        
        // Создаем отсортированный массив объектов Date
        const sortedDateObjects = Array.from(dateObjectsMap.values()).sort((a, b) => a - b);
        
        setAvailableDates(datesSet); // Для обратной совместимости с WeekDays (временно)
        setAvailableDateObjects(sortedDateObjects); // Для нового DateScroller
        
        // Устанавливаем selectedDate на первую доступную дату, если сегодня нет фильмов
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (!datesSet.has(todayStr) && sortedDateObjects.length > 0) {
          setSelectedDate(sortedDateObjects[0]); // Берем первую дату из отсортированного массива
        } else {
          // Если сегодня есть фильмы или нет доступных дат, оставляем сегодня
          setSelectedDate(new Date());
        }
        
      } catch (e) {
        console.error("Failed to fetch movies:", e);
        setError("Не удалось загрузить расписание фильмов");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Фильтрация и группировка фильмов по выбранной дате
  const getMoviesForSelectedDate = () => {
    if (!movies || movies.length === 0) return [];
    
    const selectedDateString = formatDateRussian(selectedDate);
    const groupedMovies = new Map(); // Используем Map для удобного добавления/обновления

    movies.forEach(movie => {
      if (!movie.additional_info?.show_times) return;
      
      const scheduleForDate = movie.additional_info.show_times[selectedDateString];
      if (!scheduleForDate || !Array.isArray(scheduleForDate)) return;
      
      // Если для фильма есть сеансы на эту дату, добавляем/обновляем его в Map
      if (!groupedMovies.has(movie.title)) {
        // Если фильма еще нет в Map, создаем базовую запись
        groupedMovies.set(movie.title, {
          movieData: { ...movie }, // Копируем основные данные фильма
          theaters: [] // Массив для кинотеатров и их сеансов
        });
      }
      
      const movieEntry = groupedMovies.get(movie.title);
      
      // Перебираем расписание по кинотеатрам для этого фильма на выбранную дату
      scheduleForDate.forEach(theaterSchedule => {
        const theaterName = theaterSchedule.theater || 'Кинотеатр';
        let theaterEntry = movieEntry.theaters.find(t => t.name === theaterName);
        
        // Если такого кинотеатра еще нет для этого фильма, добавляем
        if (!theaterEntry) {
          theaterEntry = { name: theaterName, showtimes: [] };
          movieEntry.theaters.push(theaterEntry);
        }
        
        // Добавляем время сеансов для этого кинотеатра, избегая дубликатов времени
        if (theaterSchedule.showtimes && Array.isArray(theaterSchedule.showtimes)) {
          // Используем Set для автоматического удаления дубликатов времени сеансов
          const currentShowtimes = new Set(theaterEntry.showtimes); 
          theaterSchedule.showtimes.forEach(timeString => {
            const timeMatch = timeString.match(/(\d{1,2}:\d{2})/);
            if (timeMatch) {
              currentShowtimes.add(timeMatch[0]); // Добавляем время в Set
            }
          });
          // Преобразуем Set обратно в отсортированный массив
          theaterEntry.showtimes = Array.from(currentShowtimes).sort(); 
        }
      });
      
      // Сортируем кинотеатры по имени
      movieEntry.theaters.sort((a, b) => a.name.localeCompare(b.name));
    });

    // Преобразуем Map в массив и сортируем фильмы по названию
    return Array.from(groupedMovies.values()).sort((a, b) => 
      a.movieData.title.localeCompare(b.movieData.title)
    );
  };

  // Функция для переключения раскрытия карточки
  const handleToggleExpand = (title) => {
    setExpandedMovieTitle(prevTitle => (prevTitle === title ? null : title));
  };

  const filteredMovies = getMoviesForSelectedDate();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className={styles.container}>
      <CalendarHeader date={selectedDate} isToday={isToday} />
      <DateScroller 
          selectedDate={selectedDate} 
          onDateSelect={(date) => { 
              setSelectedDate(date); 
              setExpandedMovieTitle(null); // Сбрасываем раскрытую карточку при смене даты
          }} 
          availableDates={availableDateObjects}
      />
      
      {loading && <p className={styles.status}>Загрузка расписания...</p>}
      {error && <p className={styles.error}>{error}</p>}
      
      {!loading && !error && filteredMovies.length === 0 && (
        <p className={styles.noMovies}>Нет фильмов на выбранную дату</p>
      )}
      
      <div className={styles.moviesList}>
        {filteredMovies.map((movieGroup, index) => (
          movieGroup && movieGroup.movieData ? (
            <MovieCard
              key={`${movieGroup.movieData.title || 'movie'}-${index}`}
              movieGroup={movieGroup}
              isExpanded={movieGroup.movieData.title === expandedMovieTitle} // Передаем флаг раскрытия
              onToggleExpand={handleToggleExpand} // Передаем обработчик
            />
          ) : null
        ))}
      </div>
    </div>
  );
};

export default MovieSchedulePage; 