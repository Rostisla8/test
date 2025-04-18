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
const BREST_LAT = 52.0976;
const BREST_LON = 23.7341;

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

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const periods = {
    todayMorning: { label: "Сегодня утром", range: [6, 12], date: todayStr, data: [] },
    todayDay:     { label: "Сегодня днем", range: [12, 18], date: todayStr, data: [] },
    todayNight:   { label: "Сегодня вечером", range: [18, 24], date: todayStr, data: [] },
    tomorrowMorning: { label: "Завтра утром", range: [6, 12], date: tomorrowStr, data: [] },
    tomorrowDay:     { label: "Завтра днем", range: [12, 18], date: tomorrowStr, data: [] },
    tomorrowNight:   { label: "Завтра вечером", range: [18, 24], date: tomorrowStr, data: [] },
  };

  // Распределяем 3-часовые прогнозы по периодам
  apiData.list.forEach(item => {
    const itemDate = new Date(item.dt * 1000);
    const itemDateStr = itemDate.toISOString().split('T')[0];
    const itemHour = itemDate.getHours();

    for (const key in periods) {
      const period = periods[key];
      if (itemDateStr === period.date && itemHour >= period.range[0] && itemHour < period.range[1]) {
        period.data.push(item);
        break; // Переходим к следующему элементу API
      }
    }
  });

  // Находим максимальную температуру и соответствующие данные для каждого периода
  const result = Object.values(periods).map(period => {
    if (period.data.length === 0) return null; // Пропускаем пустые периоды

    // Находим прогноз с максимальной температурой
    let maxTempItem = period.data[0];
    period.data.forEach(item => {
      if (item.main.temp > maxTempItem.main.temp) {
        maxTempItem = item;
      }
    });
    
    // Используем данные из прогноза с максимальной температурой
    const description = maxTempItem.weather[0]?.description || 'N/A';
    const icon = maxTempItem.weather[0]?.icon || '01d';
    
    // Добавляем дополнительные данные для всех периодов
    const humidity = maxTempItem.main?.humidity;
    const windSpeed = maxTempItem.wind?.speed;
    const pressure = maxTempItem.main?.pressure;

    return {
      label: period.label,
      temp: maxTempItem.main.temp,
      description: description.charAt(0).toUpperCase() + description.slice(1), // С большой буквы
      icon: icon,
      humidity: humidity,
      windSpeed: windSpeed,
      pressure: pressure
    };
  }).filter(Boolean); // Убираем null (пустые периоды)

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

  // --- Загрузка данных погоды ---
  useEffect(() => {
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'ВАШ_КЛЮЧ_API_OpenWeatherMap_СЮДА') {
      console.warn('Отсутствует ключ API OpenWeatherMap!');
      setWeatherError('Отсутствует ключ API для погоды');
      setLoadingWeather(false);
      return;
    }

    const loadWeatherData = async () => {
      setLoadingWeather(true);
      setWeatherError(null);

      // Для тестирования в Telegram Mini App сразу устанавливаем тестовые данные
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp: Устанавливаем тестовые значения для погоды');
        const testWeatherData = [
          {
            label: "Сегодня утром",
            temp: 19.2,
            description: "Переменная облачность",
            icon: "03d",
            humidity: 70,
            windSpeed: 3.5,
            pressure: 1012,
          },
          {
            label: "Сегодня днем",
            temp: 25.7,
            description: "Ясно",
            icon: "01d",
            humidity: 65,
            windSpeed: 4.2,
            pressure: 1011,
          },
          {
            label: "Сегодня вечером",
            temp: 20.4,
            description: "Небольшая облачность",
            icon: "02n",
            humidity: 72,
            windSpeed: 3.8,
            pressure: 1010,
          },
          {
            label: "Завтра утром",
            temp: 18.5,
            description: "Небольшой дождь",
            icon: "10d",
            humidity: 75,
            windSpeed: 6.2,
            pressure: 1010,
          },
          {
            label: "Завтра днем", 
            temp: 24.8,
            description: "Гроза",
            icon: "11d",
            humidity: 82,
            windSpeed: 8.1,
            pressure: 1007,
          },
          {
            label: "Завтра вечером",
            temp: 19.6,
            description: "Облачно с прояснениями",
            icon: "04n",
            humidity: 68,
            windSpeed: 5.4,
            pressure: 1011,
          }
        ];
        
        setWeatherData(testWeatherData);
        setLoadingWeather(false);
        return;
      }

      // Сначала проверяем кеш
      const cachedWeatherData = getFromCache(WEATHER_CACHE_KEY, CACHE_DURATION.WEATHER);
      if (cachedWeatherData) {
        console.log('Загружены данные погоды из кеша');
        setWeatherData(cachedWeatherData);
        setLoadingWeather(false);
        return;
      }

      // Если кеш пуст или устарел, делаем запрос к API
      try {
        const response = await fetch(

          // `https://api.openweathermap.org/data/2.5/weather?q=Брест&lang=ru&appid=01ffc5c2eafbb0930b2eebf9e7f897f1&units=metric`

        //  `https://api.openweathermap.org/data/2.5/forecast?appid=01ffc5c2eafbb0930b2eebf9e7f897f1&units=metric&q=Брест`

          `https://api.openweathermap.org/data/2.5/forecast?lat=${BREST_LAT}&lon=${BREST_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        if (!response.ok) {
          throw new Error(`Weather API error! status: ${response.status}`);
        }
        const data = await response.json();
        const processedData = processWeatherData(data);
        
        // Сохраняем в кеш и устанавливаем в состояние
        saveToCache(WEATHER_CACHE_KEY, processedData);
        setWeatherData(processedData);
      } catch (e) {
        console.error("Failed to fetch weather:", e);
        setWeatherError('Не удалось загрузить прогноз погоды');
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeatherData();
  }, []);

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
        <p className={styles.sectionSubtitle}>Брест, Беларусь</p>
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