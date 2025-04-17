/**
 * Утилиты для работы с Telegram Web App API
 */

// Получение объекта Telegram WebApp
const getTelegramApp = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

// Проверка, запущено ли приложение в Telegram
export const isInTelegram = () => {
  return !!getTelegramApp();
};

// Добавляем стили для Telegram Mini App
export const addTelegramStyles = () => {
  if (!isInTelegram()) return;
  
  // Добавляем стили для автоматической адаптации к Telegram Web App
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      background-color: var(--tg-theme-bg-color, #fff) !important;
      color: var(--tg-theme-text-color, #222) !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .App {
      background-color: var(--tg-theme-bg-color, #fff) !important;
    }
    
    .telegram-info {
      background-color: var(--tg-theme-secondary-bg-color, #f5f5f5) !important;
      color: var(--tg-theme-text-color, #222) !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: var(--tg-theme-text-color, #222) !important;
    }
    
    a {
      color: var(--tg-theme-link-color, #2678b6) !important;
    }
    
    button {
      background-color: var(--tg-theme-button-color, #2678b6) !important;
      color: var(--tg-theme-button-text-color, #fff) !important;
    }
  `;
  document.head.appendChild(style);
  
  // Записываем данные темы в консоль для отладки
  const tg = getTelegramApp();
  if (tg) {
    console.log('Telegram theme data:', {
      backgroundColor: tg.themeParams.bg_color,
      textColor: tg.themeParams.text_color,
      hintColor: tg.themeParams.hint_color,
      linkColor: tg.themeParams.link_color,
      buttonColor: tg.themeParams.button_color,
      buttonTextColor: tg.themeParams.button_text_color,
      secondaryBgColor: tg.themeParams.secondary_bg_color
    });
  }
};

// Инициализация Telegram Web App
export const initTelegramApp = () => {
  const tg = getTelegramApp();
  if (tg) {
    // Сообщаем Telegram, что приложение готово
    tg.ready();
    
    // Применяем стили Telegram
    addTelegramStyles();
    
    // Настраиваем цвета приложения
    const theme = tg.colorScheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    return tg;
  }
  return null;
};

// Функция для показа основной кнопки
export const showMainButton = (text, onClick) => {
  const tg = getTelegramApp();
  if (tg) {
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
    return true;
  }
  return false;
};

// Функция для скрытия основной кнопки
export const hideMainButton = () => {
  const tg = getTelegramApp();
  if (tg) {
    tg.MainButton.hide();
    return true;
  }
  return false;
};

// Получение данных пользователя Telegram
export const getUserData = () => {
  const tg = getTelegramApp();
  if (tg && tg.initDataUnsafe) {
    return tg.initDataUnsafe.user;
  }
  return null;
};

// Закрытие приложения
export const closeApp = () => {
  const tg = getTelegramApp();
  if (tg) {
    tg.close();
  }
};

// Создаем специальный метод для вывода отладочной информации
export const logTelegramInfo = () => {
  const tg = getTelegramApp();
  if (!tg) {
    console.log('Telegram WebApp не обнаружен');
    return null;
  }
  
  const info = {
    platform: tg.platform,
    version: tg.version,
    colorScheme: tg.colorScheme,
    themeParams: tg.themeParams,
    viewportHeight: tg.viewportHeight,
    viewportStableHeight: tg.viewportStableHeight,
    isExpanded: tg.isExpanded,
    headerColor: tg.headerColor
  };
  
  console.log('Telegram WebApp Info:', info);
  return info;
};

export default {
  isInTelegram,
  initTelegramApp,
  addTelegramStyles,
  showMainButton,
  hideMainButton,
  getUserData,
  closeApp,
  logTelegramInfo
}; 