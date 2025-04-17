import React from 'react';
import styles from './WeatherCard.module.css';

// Функция для получения URL иконки OpenWeatherMap
const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Словарь для перевода описаний погоды
const translateWeatherDescription = (englishDescription) => {
  const translations = {
    'clear sky': 'ясно',
    'few clouds': 'небольшая облачность',
    'scattered clouds': 'переменная облачность',
    'broken clouds': 'облачно с прояснениями',
    'overcast clouds': 'облачно',
    'light rain': 'небольшой дождь',
    'moderate rain': 'умеренный дождь',
    'heavy rain': 'сильный дождь',
    'light snow': 'небольшой снег',
    'moderate snow': 'умеренный снег',
    'heavy snow': 'сильный снег',
    'rain and snow': 'дождь со снегом',
    'mist': 'туман',
    'fog': 'туман',
    'thunderstorm': 'гроза'
    // Можно добавить другие описания по мере необходимости
  };
  
  // Приводим строку к нижнему регистру для удобства поиска в словаре
  const lowerCaseDesc = englishDescription.toLowerCase();
  
  // Возвращаем перевод или исходное описание, если перевод не найден
  return translations[lowerCaseDesc] || englishDescription;
};

// Словарь для перевода названий периодов
const translatePeriodLabel = (label) => {
  const translations = {
    // Полные названия
    'Today Day': 'Сегодня днем',
    'Today Night': 'Сегодня вечером',
    'Today Morning': 'Сегодня утром',
    'Tomorrow Day': 'Завтра днем',
    'Tomorrow Night': 'Завтра вечером',
    'Tomorrow Morning': 'Завтра утром',
    
    // Сокращенные названия
    'Tomorrow Mrn': 'Завтра утром',
    'Tomorrow Ngt': 'Завтра вечером',
    'Today Mrn': 'Сегодня утром',
    'Today Ngt': 'Сегодня вечером'
  };
  
  return translations[label] || label;
};

const WeatherCard = ({ periodLabel, temperature, description, iconCode }) => {
  // Переводим описание погоды и название периода
  const translatedDescription = translateWeatherDescription(description || '');
  const translatedPeriod = translatePeriodLabel(periodLabel);
  
  return (
    <div className={styles.weatherCard}>
      <p className={styles.periodLabel}>{translatedPeriod}</p>
      {iconCode && (
        <img 
          className={styles.weatherIcon}
          src={getWeatherIconUrl(iconCode)}
          alt={translatedDescription || 'Погода'}
        />
      )}
      <p className={styles.temperature}>{temperature !== null ? `${Math.round(temperature)}°C` : '-'}</p>
      <p className={styles.description}>{translatedDescription || ''}</p>
    </div>
  );
};

export default WeatherCard; 