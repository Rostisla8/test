import React, { useState, useEffect } from 'react';
import { isInTelegram, logTelegramInfo } from '../../services/telegramApi';

const TelegramDebugPanel = () => {
  const [telegramInfo, setTelegramInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Собираем информацию о Telegram WebApp
    if (isInTelegram()) {
      try {
        const info = logTelegramInfo();
        setTelegramInfo(info);
      } catch (error) {
        console.error('Ошибка получения информации Telegram:', error);
        setErrors(prev => [...prev, `Ошибка Telegram API: ${error.message}`]);
      }
    }

    // Отслеживаем ошибки JavaScript
    const originalConsoleError = console.error;
    console.error = (...args) => {
      setErrors(prev => [...prev, args.join(' ')]);
      originalConsoleError(...args);
    };

    // Устанавливаем обработчик для необработанных ошибок
    const handleError = (event) => {
      setErrors(prev => [...prev, `Необработанная ошибка: ${event.message} в ${event.filename}:${event.lineno}`]);
    };
    window.addEventListener('error', handleError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!isInTelegram()) {
    return null;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  // Изменяем стили панели, чтобы она была внизу экрана и не перекрывала основной контент
  const panelStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '10px',
    fontSize: '12px',
    borderTop: '1px solid #ccc',
    maxHeight: expanded ? '80vh' : '40px',
    overflow: 'auto',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    padding: '4px 8px',
    fontSize: '10px',
    marginRight: '5px',
    background: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer'
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: expanded ? '5px' : '0' }}>
        <div>
          <strong>Telegram Debug</strong>
          {errors.length > 0 && <span style={{ color: 'red', marginLeft: '5px' }}>({errors.length} ошибок)</span>}
        </div>
        <div>
          <button style={buttonStyle} onClick={toggleExpanded}>
            {expanded ? 'Свернуть' : 'Развернуть'}
          </button>
          {expanded && (
            <button style={buttonStyle} onClick={clearErrors}>
              Очистить ошибки
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div>
          <div style={{ marginTop: '10px' }}>
            <strong>Информация о Telegram WebApp:</strong>
            <pre style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(telegramInfo, null, 2)}
            </pre>
          </div>

          {errors.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong style={{ color: 'red' }}>Ошибки ({errors.length}):</strong>
              <ul style={{ maxHeight: '200px', overflow: 'auto', margin: '5px 0', padding: '0 0 0 20px' }}>
                {errors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '5px', wordBreak: 'break-word' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <strong>User Agent:</strong>
            <div style={{ fontSize: '10px', wordBreak: 'break-word' }}>
              {navigator.userAgent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramDebugPanel; 