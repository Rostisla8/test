// Тестовый скрипт для отправки запроса к API
const fetch = require('node-fetch');

// Тестовые данные пользователя Telegram
const userData = {
  telegram_id: 123456789,
  first_name: "Тестовый",
  last_name: "Пользователь",
  username: "test_user",
  photo_url: "https://avatars.githubusercontent.com/test_user?s=200",
  auth_date: 1631234567,
  hash: "test_hash"
};

// Функция для отправки запроса
async function testUserApi() {
  try {
    console.log('Отправляем запрос на сервер...');
    
    const response = await fetch('https://cy35179.tw1.ru/api/users.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Ответ от сервера:');
    console.log(JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
  }
}

// Запускаем тест
testUserApi(); 