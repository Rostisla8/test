import React from 'react';
import styles from './WeatherForecast.module.css';
import WeatherCard from '../WeatherCard/WeatherCard';

// Принимает массив обработанных данных погоды
const WeatherForecast = ({ forecastData = [] }) => {
  if (!forecastData || forecastData.length === 0) {
    return <p>Данные о погоде недоступны.</p>; // Или индикатор загрузки
  }

  return (
    <div className={styles.forecastContainer}>
      {forecastData.map((period, index) => (
        <WeatherCard 
          key={index} 
          periodLabel={period.label}
          temperature={period.temp}
          description={period.description}
          iconCode={period.icon}
        />
      ))}
    </div>
  );
};

export default WeatherForecast; 