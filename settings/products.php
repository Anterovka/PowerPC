<?php
// Создаем базу данных и таблицу, если они не существуют
$dbFile = 'db.sqlite';
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        price INTEGER NOT NULL,
        components TEXT NOT NULL
    )");
} catch (PDOException $e) {
    echo "Ошибка: " . $e->getMessage();
}

// Обработка POST-запросов для добавления и удаления сборок
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if (isset($_POST['action']) && $_POST['action'] === 'add') {
            // Добавление сборки
            $name = $_POST['name'];
            $image = 'img/' . $_POST['image'];
            $price = $_POST['price'];
            $components = $_POST['components'];

            $stmt = $db->prepare("INSERT INTO products (name, image, price, components) VALUES (:name, :image, :price, :components)");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':image', $image);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':components', $components);
            $stmt->execute();
        } elseif (isset($_POST['action']) && $_POST['action'] === 'delete') {
            // Удаление сборки
            $id = $_POST['id'];
            $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
        }
    } catch (PDOException $e) {
        echo "Ошибка: " . $e->getMessage();
    }
}

// Получение всех сборок для отображения
$products = [];
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query("SELECT * FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Ошибка: " . $e->getMessage();
}

$db = null;
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление сборками</title>
    <style>
        html { scroll-behavior: smooth; }
        body {
            background: #202020;
            margin: 0;
            font-family: "Roboto", sans-serif;
            color: #d8d8d8;
            line-height: 1.6;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #ffffff;
            margin-bottom: 20px;
        }
        form {
            background: #333333;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        label {
            display: block;
            margin: 10px 0 5px;
        }
        input[type="text"],
        input[type="number"],
        textarea {
            width: calc(100% - 20px);
            padding: 10px;
            border: 1px solid #555555;
            border-radius: 4px;
            background: #444444;
            color: #ffffff;
        }
        button {
            background: #007BFF;
            color: #ffffff;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #0056b3;
        }
        .product {
            background: #333333;
            border: 1px solid #444444;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        .product h3 {
            margin: 0;
            color: #ffffff;
        }
        .product img {
            max-width: 100px;
            border-radius: 4px;
        }
        .product p {
            margin: 10px 0;
        }
        .delete-button {
            background: #dc3545;
        }
        .delete-button:hover {
            background: #c82333;
        }
    </style>
</head>
<body>

<h1>Добавить сборку</h1>
<form method="POST">
    <input type="hidden" name="action" value="add">
    <label for="name">Название:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="image">Изображение:</label>
    <input type="text" id="image" name="image" required>
    
    <label for="price">Цена:</label>
    <input type="number" id="price" name="price" required>
    
    <label for="components">Компоненты:</label>
    <textarea id="components" name="components" required></textarea>
    
    <button type="submit">Добавить сборку</button>
</form>

<h1>Существующие сборки</h1>
<div id="productsList">
    <?php foreach ($products as $product): ?>
        <div class="product">
            <h3><?php echo htmlspecialchars($product['name']); ?> (Цена: <?php echo htmlspecialchars($product['price']); ?> ₽)</h3>
            <img src="../<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
            <p><strong>Компоненты:</strong><br><?php echo nl2br(htmlspecialchars($product['components'])); ?></p>
            <form method="POST" style="display:inline;">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
                <button type="submit" class="delete-button" onclick="return confirm('Вы уверены, что хотите удалить эту сборку?');">Удалить</button>
            </form>
        </div>
    <?php endforeach; ?>
</div>

</body>
</html>
