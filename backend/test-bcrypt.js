const bcrypt = require('bcrypt');

// Тестируем хеширование и сравнение
const password = '123456';
const saltRounds = 10;

console.log('Тестирование bcrypt...');
console.log('Пароль:', password);

// Хешируем пароль
const hash = bcrypt.hashSync(password, saltRounds);
console.log('Хеш:', hash);

// Проверяем пароль
const isValid = bcrypt.compareSync(password, hash);
console.log('Пароль верный:', isValid);

// Проверяем неправильный пароль
const isInvalid = bcrypt.compareSync('wrongpassword', hash);
console.log('Неправильный пароль:', isInvalid); 