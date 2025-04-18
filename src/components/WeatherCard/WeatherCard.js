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

// Преобразование скорости ветра из м/с в удобочитаемый формат
const formatWindSpeed = (windSpeed) => {
  if (windSpeed === undefined) return null;
  
  let description = '';
  if (windSpeed < 2) description = 'слабый';
  else if (windSpeed < 5) description = 'умеренный';
  else if (windSpeed < 10) description = 'сильный';
  else description = 'очень сильный';
  
  return `${description}, ${windSpeed.toFixed(1)} м/с`;
};

// Преобразование давления из гПа в мм рт.ст.
const formatPressure = (pressureHPa) => {
  if (pressureHPa === undefined) return null;
  
  // Примерный коэффициент перевода гПа в мм рт.ст.
  const mmHg = Math.round(pressureHPa * 0.750062);
  return `${mmHg} мм рт.ст.`;
};

const WeatherCard = ({ periodLabel, temperature, description, iconCode, humidity, windSpeed, pressure }) => {
  // Переводим описание погоды и название периода
  const translatedDescription = translateWeatherDescription(description || '');
  const translatedPeriod = translatePeriodLabel(periodLabel);
  const formattedWindSpeed = formatWindSpeed(windSpeed);
  const formattedPressure = formatPressure(pressure);
  
  // Проверяем, содержит ли период слово "Завтра"
  const isTomorrow = translatedPeriod.toLowerCase().includes('завтра');
  
  // Добавляем класс для выделения прогноза на завтра
  const cardClassName = `${styles.weatherCard} ${isTomorrow ? styles.tomorrowCard : ''}`;
  
  // Определяем, есть ли доп. информация для отображения
  const hasAdditionalInfo = humidity !== undefined || windSpeed !== undefined || pressure !== undefined;
  
  return (
    <div className={cardClassName}>
      <div className={styles.cardHeader}>
        <p className={styles.periodLabel}>{translatedPeriod}</p>
        {iconCode && (
          <img 
            className={styles.weatherIcon}
            src={getWeatherIconUrl(iconCode)}
            alt={translatedDescription || 'Погода'}
          />
        )}
      </div>
      
      <p className={styles.temperature}>{temperature !== null ? `${Math.round(temperature)}°C` : '-'}</p>
      <p className={styles.description}>{translatedDescription || ''}</p>
      
      {/* Дополнительная информация о погоде (для всех периодов, если данные доступны) */}
      {hasAdditionalInfo && (
        <div className={styles.additionalInfo}>
          {humidity !== undefined && (
            <p className={styles.detailRow}>
              <span className={styles.detailLabel}>Влажность:</span> 
              <span className={styles.detailValue}>{humidity}%</span>
            </p>
          )}
          
          {formattedWindSpeed && (
            <p className={styles.detailRow}>
              <span className={styles.detailLabel}>Ветер:</span>
              <span className={styles.detailValue}>{formattedWindSpeed}</span>
            </p>
          )}
          
          {formattedPressure && (
            <p className={styles.detailRow}>
              <span className={styles.detailLabel}>Давление:</span>
              <span className={styles.detailValue}>{formattedPressure}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherCard; 