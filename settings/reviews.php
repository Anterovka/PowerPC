<?php
// Создаем базу данных и таблицу, если они не существуют
$dbFile = 'db.sqlite';
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT NOT NULL
    )");
} catch (PDOException $e) {
    echo "Ошибка: " . $e->getMessage();
}

// Обработка POST-запросов для добавления и удаления отзывов
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if (isset($_POST['action']) && $_POST['action'] === 'add') {
            // Добавление отзыва
            $name = $_POST['name'];
            $rating = $_POST['rating'];
            $text = $_POST['text'];

            $stmt = $db->prepare("INSERT INTO reviews (name, rating, text) VALUES (:name, :rating, :text)");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':rating', $rating);
            $stmt->bindParam(':text', $text);
            $stmt->execute();
        } elseif (isset($_POST['action']) && $_POST['action'] === 'delete') {
            // Удаление отзыва
            $id = $_POST['id'];
            $stmt = $db->prepare("DELETE FROM reviews WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
        }
    } catch (PDOException $e) {
        echo "Ошибка: " . $e->getMessage();
    }
}

// Получение всех отзывов для отображения
$reviews = [];
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query("SELECT * FROM reviews");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
    <title>Отзывы</title>
    <style>
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
        .testimonial {
            background: #333333;
            border: 1px solid #444444;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        .testimonial h3 {
            margin: 0;
            color: #ffffff;
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

<h1>Добавить отзыв</h1>
<form method="POST">
    <input type="hidden" name="action" value="add">
    <label for="name">Имя:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="rating">Рейтинг:</label>
    <input type="number" id="rating" name="rating" min="1" max="5" required>
    
    <label for="text">Текст отзыва:</label>
    <textarea id="text" name="text" required></textarea>
    
    <button type="submit">Добавить отзыв</button>
</form>

<h1>Существующие отзывы</h1>
<div id="reviewsList">
    <?php foreach ($reviews as $testimonial): ?>
        <div class="testimonial">
            <h3><?php echo htmlspecialchars($testimonial['name']); ?> (Рейтинг: <?php echo htmlspecialchars($testimonial['rating']); ?>)</h3>
            <p><?php echo nl2br(htmlspecialchars($testimonial['text'])); ?></p>
            <form method="POST" style="display:inline;">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?php echo $testimonial['id']; ?>">
                <button type="submit" class="delete-button" onclick="return confirm('Вы уверены, что хотите удалить этот отзыв?');">Удалить</button>
            </form>
        </div>
    <?php endforeach; ?>
</div>

</body>
</html>
