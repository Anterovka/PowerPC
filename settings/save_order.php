<?php
header('Content-Type: application/json');

// Подключение к базе данных SQLite
$db = new SQLite3('your_database_name.db');

// Получение данных из запроса
$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_BCRYPT); // Хешируем пароль
$address = $data['address'];
$items = $data['items'];
$totalPrice = $data['totalPrice'];

// Проверка на существование пользователя
$stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
$stmt->bindValue(':email', $email, SQLITE3_TEXT);
$user = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

if ($user) {
    echo json_encode(['error' => 'Пользователь с таким email уже существует.']);
    exit;
}

// Регистрация нового пользователя
$stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
$stmt->bindValue(':name', $name, SQLITE3_TEXT);
$stmt->bindValue(':email', $email, SQLITE3_TEXT);
$stmt->bindValue(':password', $password, SQLITE3_TEXT);
$stmt->execute();
$userId = $db->lastInsertRowID(); // Получаем ID нового пользователя

// Сохранение заказа
$stmt = $db->prepare("INSERT INTO orders (user_id, address, total_price) VALUES (:user_id, :address, :total_price)");
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':address', $address, SQLITE3_TEXT);
$stmt->bindValue(':total_price', $totalPrice, SQLITE3_FLOAT);
$stmt->execute();
$orderId = $db->lastInsertRowID(); // Получаем ID нового заказа

// Сохранение товаров в заказе
foreach ($items as $item) {
    $stmt = $db->prepare("INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (:order_id, :product_name, :price, :quantity)");
    $stmt->bindValue(':order_id', $orderId, SQLITE3_INTEGER);
    $stmt->bindValue(':product_name', $item['name'], SQLITE3_TEXT);
    $stmt->bindValue(':price', $item['price'], SQLITE3_FLOAT);
    $stmt->bindValue(':quantity', $item['quantity'], SQLITE3_INTEGER);
    $stmt->execute();
}

// Отправка успешного ответа
echo json_encode(['success' => true, 'orderId' => $orderId]);

// Закрытие соединения
$db->close();
?>
