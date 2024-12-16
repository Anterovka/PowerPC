const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Функция для чтения данных из файла
const readProductsFromFile = () => {
    const data = fs.readFileSync('products.json');
    return JSON.parse(data);
};

// Получение всех продуктов
app.get('/products', (req, res) => {
    try {
        const products = readProductsFromFile();
        res.json(products);
    } catch (error) {
        res.status(500).send('Ошибка при чтении данных');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


