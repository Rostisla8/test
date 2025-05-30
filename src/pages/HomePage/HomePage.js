import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './HomePage.module.css';
import Header from '../../components/Header/Header';
import SubjectCard from '../../components/SubjectCard/SubjectCard';
import AddCurrencyCard from '../../components/AddCurrencyCard/AddCurrencyCard';
import CurrencyModal from '../../components/CurrencyModal/CurrencyModal';
import WeatherForecast from '../../components/WeatherForecast/WeatherForecast';
import { FaDollarSign, FaRubleSign, FaEuroSign, FaQuestionCircle, FaPoundSign, FaYenSign, FaWonSign, FaLiraSign } from 'react-icons/fa'; // Добавили еще иконок
import { SiTether } from "react-icons/si"; // Пример использования другой библиотеки иконок


// --- Определяем основные валюты, доступные для добавления ---
// Включаем ID, код, название (для модального окна) и масштаб (для расчета курса)
const mainAvailableCurrencies = [
  { Cur_ID: 431, Cur_Abbreviation: 'USD', Cur_Name: 'Доллар США', Cur_Scale: 1, icon: <FaDollarSign size={20} color="#fff" /> },
  { Cur_ID: 451, Cur_Abbreviation: 'EUR', Cur_Name: 'Евро', Cur_Scale: 1, icon: <FaEuroSign size={20} color="#fff" /> },
  { Cur_ID: 456, Cur_Abbreviation: 'RUB', Cur_Name: 'Российский рубль', Cur_Scale: 100, icon: <FaRubleSign size={20} color="#fff" /> },
  { Cur_ID: 452, Cur_Abbreviation: 'PLN', Cur_Name: 'Польский злотый', Cur_Scale: 10, icon: <FaQuestionCircle size={20} color="#fff" /> }, // Нужно найти иконку злотого
  { Cur_ID: 518, Cur_Abbreviation: 'CNY', Cur_Name: 'Китайский юань', Cur_Scale: 10, icon: <FaYenSign size={20} color="#fff" /> }, // Используем иену как заглушку
  { Cur_ID: 429, Cur_Abbreviation: 'GBP', Cur_Name: 'Фунт стерлингов', Cur_Scale: 1, icon: <FaPoundSign size={20} color="#fff" /> },
  { Cur_ID: 449, Cur_Abbreviation: 'UAH', Cur_Name: 'Гривна', Cur_Scale: 100, icon: <FaQuestionCircle size={20} color="#fff" /> }, // Нужна иконка гривны
  // Можно добавить еще: CHF (426), JPY (440, scale 100), KZT (462, scale 1000), CAD (448) и т.д.
  // { Cur_ID: 462, Cur_Abbreviation: 'KZT', Cur_Name: 'Тенге', Cur_Scale: 1000, icon: <FaQuestionCircle size={20} color="#fff" /> }, 
];

// Начальные валюты (должны быть из списка mainAvailableCurrencies)
const initialCurrencies = mainAvailableCurrencies.filter(c => ['USD', 'RUB', 'EUR'].includes(c.Cur_Abbreviation))
    .map(c => ({ id: c.Cur_ID, code: c.Cur_Abbreviation, rate: null, color: c.color || '#ccc', icon: c.icon, scale: c.Cur_Scale }));

// Переназначаем цвета для начальных валют, если нужно
initialCurrencies.find(c => c.code === 'USD').color = '#F9A826';
initialCurrencies.find(c => c.code === 'RUB').color = '#5C6BC0';
initialCurrencies.find(c => c.code === 'EUR').color = '#4CAF50';


const MAX_CARDS = 6;
const colorPalette = ['#EF5350', '#AB47BC', '#26A69A', '#FF7043', '#78909C']; // Оставляем палитру для новых

// --- Константы для погоды ---
const OPENWEATHER_API_KEY = '2d171b1ba6df8f45cb44e8d2cdbefaf7'; // <--- ЗАМЕНИТЕ НА ВАШ КЛЮЧ!
const BREST_LAT = 52.0976; // Фиксированные координаты Бреста
const BREST_LON = 23.7341;
const BREST_LOCATION_NAME = 'Брест, Беларусь';

// --- Константы для кеширования ---
const WEATHER_CACHE_KEY = 'weatherData';
const RATES_CACHE_KEY = 'currencyRates';
const CACHE_DURATION = {
  WEATHER: 60 * 60 * 1000, // 1 час для погоды
  RATES: 3 * 60 * 60 * 1000 // 3 часа для курсов валют
};

// --- Функции для работы с кешем ---
const saveToCache = (key, data) => {
  try {
    const cacheItem = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (e) {
    console.warn('Не удалось сохранить данные в кеш:', e);
  }
};

const getFromCache = (key, maxAge) => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const cacheItem = JSON.parse(cachedData);
    const now = Date.now();
    
    // Проверяем, не устарели ли данные
    if (now - cacheItem.timestamp > maxAge) {
      localStorage.removeItem(key); // Удаляем устаревшие данные
      return null;
    }
    
    return cacheItem.data;
  } catch (e) {
    console.warn('Ошибка при чтении из кеша:', e);
    return null;
  }
};

// Функция для обработки данных погоды
const processWeatherData = (apiData) => {
  if (!apiData || !apiData.list) return [];

  // Текущая дата и время
  const now = new Date();
  
  // Устанавливаем точку отсчета - начало текущего дня (00:00)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Начало завтрашнего дня
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  
  // Начало послезавтрашнего дня
  const dayAfterTomorrowStart = new Date(todayStart);
  dayAfterTomorrowStart.setDate(todayStart.getDate() + 2);
  
  const result = [];
  
  // Получаем прогнозы с интервалом в 3 часа на ближайшие дни
  apiData.list.forEach((item) => {
    // Преобразуем время из timestamp в объект Date
    const itemDate = new Date(item.dt * 1000);
    
    // Определяем к какому дню относится прогноз
    let dayLabel;
    
    if (itemDate >= todayStart && itemDate < tomorrowStart) {
      dayLabel = 'Сегодня';
    } else if (itemDate >= tomorrowStart && itemDate < dayAfterTomorrowStart) {
      dayLabel = 'Завтра';
    } else {
      // Форматируем дату для отображения (например, "12.03")
      const day = itemDate.getDate().toString().padStart(2, '0');
      const month = (itemDate.getMonth() + 1).toString().padStart(2, '0');
      dayLabel = `${day}.${month}`;
    }
    
    // Форматируем время для отображения
    const hours = itemDate.getHours();
    const formattedHours = hours.toString().padStart(2, '0');
    
    // Создаем объект для отображения
    result.push({
      time: `${dayLabel}, ${formattedHours}:00`,
      temp: item.main.temp,
      description: item.weather[0]?.description.charAt(0).toUpperCase() + item.weather[0]?.description.slice(1),
      icon: item.weather[0]?.icon,
      humidity: item.main?.humidity,
      windSpeed: item.wind?.speed,
      pressure: item.main?.pressure
    });
  });

  return result;
};

const HomePage = () => {
  const [displayedCurrencies, setDisplayedCurrencies] = useState(initialCurrencies);
  const [loadingRates, setLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Состояния для погоды ---
  const [weatherData, setWeatherData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  
  // --- Состояние для местоположения пользователя ---
  const [userLocation, setUserLocation] = useState({
    lat: BREST_LAT,
    lon: BREST_LON,
    name: BREST_LOCATION_NAME
  });

  // --- Получение местоположения пользователя ---
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Получены координаты пользователя:', latitude, longitude);
            
            // Получаем название места по координатам
            try {
              const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
              );
              
              if (response.ok) {
                const data = await response.json();
                let locationName = BREST_LOCATION_NAME; // По умолчанию
                
                if (data && data.length > 0) {
                  const place = data[0];
                  locationName = place.local_names && place.local_names.ru
                    ? `${place.local_names.ru}, ${place.country}`
                    : `${place.name}, ${place.country}`;
                }
                
                console.log('Определено местоположение:', locationName);
                
                // Обновляем состояние с координатами и названием
                setUserLocation({
                  lat: latitude,
                  lon: longitude,
                  name: locationName
                });
              }
            } catch (error) {
              console.error('Ошибка при определении названия места:', error);
              // Используем только координаты, без названия
              setUserLocation({
                lat: latitude,
                lon: longitude,
                name: BREST_LOCATION_NAME
              });
            }
          },
          (error) => {
            console.error('Ошибка геолокации:', error);
            // В случае ошибки используем координаты Бреста
          }
        );
      } else {
        console.log('Геолокация не поддерживается в этом браузере');
        // Используем координаты Бреста
      }
    };
    
    getUserLocation();
  }, []);

  // --- Загрузка курсов для ОТОБРАЖАЕМЫХ валют ---
  const fetchRates = useCallback(async (currenciesToFetch) => {
    if (!currenciesToFetch || currenciesToFetch.length === 0) {
      setLoadingRates(false);
      return;
    }
    setLoadingRates(true);
    setRatesError(null);
    
    const idsToFetch = currenciesToFetch.map(c => c.id);

    // Проверяем, какие валюты нам нужно получить с сервера, а какие можно взять из кеша
    const cachedRatesData = getFromCache(RATES_CACHE_KEY, CACHE_DURATION.RATES) || {};
    const idsToFetchFromApi = [];
    
    // Помечаем, какие валюты нам нужно получить с сервера
    idsToFetch.forEach(id => {
      if (!cachedRatesData[id] || !cachedRatesData[id].rate) {
        idsToFetchFromApi.push(id);
      }
    });
    
    // Если есть валюты в кеше, обновляем их сразу
    if (Object.keys(cachedRatesData).length > 0) {
      setDisplayedCurrencies(prevCurrencies =>
        prevCurrencies.map(currency => {
          if (cachedRatesData[currency.id] && cachedRatesData[currency.id].rate) {
            return {
              ...currency,
              rate: cachedRatesData[currency.id].rate
            };
          }
          return currency;
        })
      );
    }
    
    // Если все валюты в кеше, завершаем
    if (idsToFetchFromApi.length === 0) {
      console.log('Все курсы валют загружены из кеша');
      setLoadingRates(false);
      return;
    }
    
    // Иначе запрашиваем только недостающие валюты
    try {
      const responses = await Promise.all(
        idsToFetchFromApi.map(id => fetch(`https://api.nbrb.by/exrates/rates/${id}`))
      );

      for (const response of responses) {
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status} for ${response.url}`);
        }
      }

      const ratesData = await Promise.all(
          responses.map(res => res.ok ? res.json() : Promise.resolve(null))
      );
      
      // Добавляем полученные валюты в кеш
      const newCachedRates = { ...cachedRatesData };
      
      setDisplayedCurrencies(prevCurrencies => {
        const updatedCurrencies = prevCurrencies.map(currency => {
          // Ищем информацию по этой валюте среди новых данных
          const rateInfo = ratesData.find(rate => rate && rate.Cur_ID === currency.id);
          if (rateInfo) {
            const officialRate = rateInfo.Cur_OfficialRate;
            const scale = currency.scale || rateInfo.Cur_Scale || 1;
            const calculatedRate = (officialRate / scale).toFixed(4);
            
            // Сохраняем в объект кеша
            newCachedRates[currency.id] = {
              rate: calculatedRate,
              scale: scale
            };
            
            return {
              ...currency,
              rate: calculatedRate
            };
          }
          return currency;
        });
        
        // Сохраняем обновленный кеш
        saveToCache(RATES_CACHE_KEY, newCachedRates);
        
        return updatedCurrencies;
      });

    } catch (e) {
      console.error("Failed to fetch rates:", e);
      setRatesError('Не удалось загрузить курсы валют');
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(initialCurrencies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Загрузка погоды ---
  useEffect(() => {
    const loadWeatherData = async () => {
      setLoadingWeather(true);
      setWeatherError(null);

      // Проверяем наличие ключа API
      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'ВАШ_КЛЮЧ_API_OpenWeatherMap_СЮДА') {
        console.warn('Отсутствует ключ API OpenWeatherMap!');
        setWeatherError('Отсутствует ключ API для погоды');
        setLoadingWeather(false);
        return;
      }

      // Используем координаты пользователя или координаты Бреста по умолчанию
      // Также создаем ключ кеша, основанный на координатах
      const userLat = userLocation.lat;
      const userLon = userLocation.lon;
      const cacheKey = `${WEATHER_CACHE_KEY}_${userLat.toFixed(2)}_${userLon.toFixed(2)}`;
      
      // Сначала проверяем кеш
      const cachedWeatherData = getFromCache(cacheKey, CACHE_DURATION.WEATHER);
      if (cachedWeatherData) {
        console.log('Загружены данные погоды из кеша');
        setWeatherData(cachedWeatherData);
        setLoadingWeather(false);
        return;
      }

      // Если кеш пуст или устарел, делаем запрос к API
      try {
        // Запрашиваем данные с более частыми интервалами (каждые 3 часа на 2 дня)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${userLat}&lon=${userLon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ru&cnt=16`
        );
        
        if (!response.ok) {
          throw new Error(`Weather API error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные погоды из API');
        
        const processedData = processWeatherData(data);
        
        // Сохраняем в кеш и устанавливаем в состояние
        saveToCache(cacheKey, processedData);
        setWeatherData(processedData);
      } catch (e) {
        console.error("Failed to fetch weather:", e);
        setWeatherError('Не удалось загрузить прогноз погоды');
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeatherData();
  }, [userLocation]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSelectCurrency = (selectedCurrency) => {
    if (displayedCurrencies.length >= MAX_CARDS) {
      alert(`Достигнуто максимальное количество карточек (${MAX_CARDS}).`);
      return;
    }
    if (displayedCurrencies.some(c => c.id === selectedCurrency.Cur_ID)) {
      alert(`${selectedCurrency.Cur_Abbreviation} уже отображается.`);
      return;
    }

    const nextColorIndex = displayedCurrencies.length % colorPalette.length;
    const newColor = colorPalette[nextColorIndex];
    // Берем иконку из нашего предопределенного списка или ставим дефолтную
    const currencyInfo = mainAvailableCurrencies.find(c => c.Cur_ID === selectedCurrency.Cur_ID);
    const newIcon = currencyInfo?.icon || <FaQuestionCircle size={20} color="#fff" />;

    const newCurrencyEntry = {
      id: selectedCurrency.Cur_ID,
      code: selectedCurrency.Cur_Abbreviation,
      rate: null,
      color: newColor,
      icon: newIcon,
      scale: selectedCurrency.Cur_Scale || 1
    };

    const updatedCurrencies = [...displayedCurrencies, newCurrencyEntry];
    setDisplayedCurrencies(updatedCurrencies);
    // Запрашиваем курс только для новой валюты
    fetchRates([newCurrencyEntry]); 
    handleCloseModal();
  };

  const handleRemoveCard = (currencyIdToRemove) => {
      if (displayedCurrencies.length <= 1) {
          alert("Нельзя удалить последнюю карточку валюты.");
          return;
      }
    setDisplayedCurrencies(prev => prev.filter(c => c.id !== currencyIdToRemove));
  };

  const displayedCurrencyIds = useMemo(() => displayedCurrencies.map(c => c.id), [displayedCurrencies]);

  return (
    <div className={styles.homePage}>
      <Header />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Курсы валют</h2>
        <p className={styles.sectionSubtitle}>Официальные курсы НБРБ</p>
        <div className={styles.subjectsGrid}>
          {/* Убрали отображение loadingRates */} 
          {/* {loadingRates && displayedCurrencies.every(c => c.rate === null) && <p>Loading rates...</p>} */}
          {ratesError && <p style={{ color: 'red' }}>{ratesError}</p>}
          
          {displayedCurrencies.map((currency) => (
            <SubjectCard
              key={currency.id}
              title={`${currency.code} / BYN`}
              rate={currency.rate === null ? '...' : `1 ${currency.code} = ${currency.rate} BYN`}
              icon={currency.icon} // Используем иконку из состояния
              color={currency.color}
              onRemove={() => handleRemoveCard(currency.id)}
            />
          ))}
          
          {displayedCurrencies.length < MAX_CARDS && (
            <AddCurrencyCard onClick={handleOpenModal} />
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.weatherSection}`}>
        <h2 className={styles.sectionTitle}>Прогноз погоды</h2>
        <p className={styles.sectionSubtitle}>{userLocation.name}</p>
        {loadingWeather && <p>Загрузка погоды...</p>}
        {weatherError && <p style={{ color: 'red' }}>{weatherError}</p>}
        {!loadingWeather && !weatherError && (
          <WeatherForecast forecastData={weatherData} />
        )}
      </section>

      <CurrencyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectCurrency={handleSelectCurrency}
        // Передаем наш предопределенный список
        availableCurrencies={mainAvailableCurrencies} 
        displayedCurrencyIds={displayedCurrencyIds}
        // Убрали isLoading и error, т.к. список статичный
      />
    </div>
  );
};

export default HomePage; 