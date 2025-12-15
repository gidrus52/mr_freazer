const bcrypt = require('bcrypt');

// Тестируем конкретный хеш из базы данных
const storedHash = '$2b$10$XYi4fRcvdH2uAPHFPnmDfeEAjjlZXNNJosw01GmIGbt8SBzB7984C';
const password = '123456';

console.log('Тестирование конкретного хеша из БД...');
console.log('Хеш из БД:', storedHash);
console.log('Пароль для проверки:', password);

// Проверяем пароль
const isValid = bcrypt.compareSync(password, storedHash);
console.log('Пароль верный:', isValid);

// Проверяем неправильный пароль
const isInvalid = bcrypt.compareSync('wrongpassword', storedHash);
console.log('Неправильный пароль:', isInvalid);

// Создаем новый хеш для сравнения
const newHash = bcrypt.hashSync(password, 10);
console.log('Новый хеш:', newHash);
console.log('Новый хеш работает:', bcrypt.compareSync(password, newHash)); 