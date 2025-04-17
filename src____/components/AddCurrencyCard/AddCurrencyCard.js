import React from 'react';
import { FaPlus } from 'react-icons/fa';
import styles from './AddCurrencyCard.module.css';

const AddCurrencyCard = ({ onClick }) => {
  return (
    <button className={styles.addCard} onClick={onClick} title="Добавить валюту">
      <FaPlus size={24} />
    </button>
  );
};

export default AddCurrencyCard; 