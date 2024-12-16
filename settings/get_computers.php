<?php
header('Content-Type: application/json');

$dbFile = 'db.sqlite'; // Убедитесь, что путь к вашей базе данных правильный

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Получаем все компьютеры
    $stmt = $db->query("SELECT * FROM products");
    $computers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Форматируем данные
    $formattedComputers = array_map(function($computer) {
        return [
            'id' => $computer['id'],
            'name' => $computer['name'],
            'image' => $computer['image'],
            'price' => (int)$computer['price'],
            'components' => explode('; ', $computer['components']) // Преобразуем строку компонентов в массив
        ];
    }, $computers);

    echo json_encode($formattedComputers);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$db = null;
?>
