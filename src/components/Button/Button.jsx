import React from 'react';
import styles from './Button.module.css';

/**
 * Компонент кнопки
 * @param {Object} props - Свойства компонента
 * @param {string} [props.variant] - Вариант кнопки: 'primary', 'secondary', 'text', 'icon'
 * @param {string} [props.size] - Размер кнопки: 'small', 'medium' (по умолчанию), 'large'
 * @param {boolean} [props.fullWidth] - Растянуть кнопку на всю ширину контейнера
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @param {boolean} [props.disabled] - Отключена ли кнопка
 * @param {React.ReactNode} [props.children] - Содержимое кнопки
 * @param {Function} [props.onClick] - Обработчик клика
 * @param {string} [props.type] - Тип кнопки: 'button', 'submit', 'reset'
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.medium;
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  
  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 