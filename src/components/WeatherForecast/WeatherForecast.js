import React from 'react';
import styles from './WeatherForecast.module.css';

// Компонент для отображения прогноза погоды по часам с прокруткой вправо
const WeatherForecast = ({ forecastData = [] }) => {
  if (!forecastData || forecastData.length === 0) {
    return <p>Данные о погоде недоступны.</p>;
  }

  return (
    <div className={styles.forecastContainer}>
      {forecastData.map((item, index) => (
        <div key={index} className={styles.weatherItem}>
          <p className={styles.timeLabel}>{item.time || item.label}</p>
          <div className={styles.weatherIcon}>
            {item.icon && <img 
              src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
              alt={item.description || 'Погода'}
            />}
          </div>
          <p className={styles.temperature}>{Math.round(item.temp)}°C</p>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.weatherDetails}>
            <p className={styles.detail}>
              <span className={styles.detailLabel}>Влажность:</span> 
              <span className={styles.detailValue}>{item.humidity}%</span>
            </p>
            <p className={styles.detail}>
              <span className={styles.detailLabel}>Ветер:</span> 
              <span className={styles.detailValue}>{item.windSpeed} м/с</span>
            </p>
            <p className={styles.detail}>
              <span className={styles.detailLabel}>Давление:</span> 
              <span className={styles.detailValue}>{Math.round(item.pressure * 0.750062)} мм рт.ст.</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherForecast; 