import React, { useState, useMemo } from 'react';
import styles from './CurrencyModal.module.css';
import { FaTimes } from 'react-icons/fa';

const CurrencyModal = ({ 
  isOpen, 
  onClose, 
  onSelectCurrency, 
  availableCurrencies = [], // Список всех валют от API
  displayedCurrencyIds = [], // ID валют, которые уже отображены
  isLoading, 
  error 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтруем валюты, исключая уже добавленные и по поиску
  const filteredCurrencies = useMemo(() => {
    return availableCurrencies
      .filter(currency => 
        // Исключаем уже отображенные
        !displayedCurrencyIds.includes(currency.Cur_ID) &&
        // Фильтруем по названию или аббревиатуре (регистронезависимо)
        (currency.Cur_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         currency.Cur_Abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      // Сортируем по названию для удобства
      .sort((a, b) => a.Cur_Name.localeCompare(b.Cur_Name));
  }, [availableCurrencies, displayedCurrencyIds, searchTerm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}> {/* Закрытие по клику на фон */} 
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}> {/* Предотвращаем закрытие при клике внутри модалки */} 
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть окно">
          <FaTimes />
        </button>
        <h2>Выбор валюты</h2>
        
        <input 
          type="text"
          placeholder="Поиск валюты..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading && <p>Загрузка валют...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        
        {!isLoading && !error && (
          <ul className={styles.currencyList}>
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <li key={currency.Cur_ID} onClick={() => onSelectCurrency(currency)}>
                  {currency.Cur_Name} ({currency.Cur_Abbreviation})
                </li>
              ))
            ) : (
              <li className={styles.noResults}>Валюты не найдены.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrencyModal; 