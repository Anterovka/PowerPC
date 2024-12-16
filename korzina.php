<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['cpu']) && isset($_POST['gpu']) && isset($_POST['ram'])) {
        $cpu = $_POST['cpu'];
        $gpu = $_POST['gpu'];
        $ram = $_POST['ram'];
        $config = [
            'cpu' => $cpu,
            'gpu' => $gpu,
            'ram' => $ram
        ];

        $configs = isset($_COOKIE['pc_configs']) ? json_decode($_COOKIE['pc_configs'], true) : [];

        $configs[] = $config;
        setcookie('pc_configs', json_encode($configs), time() + (30 * 24 * 60 * 60), "/");
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit();
    }

    if (isset($_POST['remove_index'])) {
        $removeIndex = $_POST['remove_index'];
        $configs = isset($_COOKIE['pc_configs']) ? json_decode($_COOKIE['pc_configs'], true) : [];

        if (isset($configs[$removeIndex])) {
            unset($configs[$removeIndex]);
        }
        setcookie('pc_configs', json_encode(array_values($configs)), time() + (30 * 24 * 60 * 60), "/");
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit();
    }
}

$configs = isset($_COOKIE['pc_configs']) ? json_decode($_COOKIE['pc_configs'], true) : [];
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Конфигурация ПК</title>
</head>
<body>
    <h1>Выберите конфигурацию ПК</h1>
    <form action="" method="post">
        <label for="cpu">Процессор:</label>
        <select name="cpu" id="cpu">
            <option value="intel_i5">Intel i5</option>
            <option value="intel_i7">Intel i7</option>
            <option value="amd_ryzen_5">AMD Ryzen 5</option>
            <option value="amd_ryzen_7">AMD Ryzen 7</option>
        </select>
        <br>

        <label for="gpu">Видеокарта:</label>
        <select name="gpu" id="gpu">
            <option value="nvidia_gtx_1660">NVIDIA GTX 1660</option>
            <option value="nvidia_rtx_3060">NVIDIA RTX 3060</option>
            <option value="amd_rx_5700">AMD RX 5700</option>
            <option value="amd_rx_6800">AMD RX 6800</option>
        </select>
        <br>

        <label for="ram">Оперативная память:</label>
        <select name="ram" id="ram">
            <option value="8gb">8 GB</option>
            <option value="16gb">16 GB</option>
            <option value="32gb">32 GB</option>
        </select>
        <br>

        <button type="submit">Добавить в корзину</button>
    </form>

    <h2>Сохраненные конфигурации:</h2>
    <?php if (!empty($configs)): ?>
        <ul>
            <?php foreach ($configs as $index => $config): ?>
                <li>
                    Процессор: <?= htmlspecialchars($config['cpu']) ?>
                    , Видеокарта: <?= htmlspecialchars($config['gpu']) ?>, 
                    Оперативная память: <?= htmlspecialchars($config['ram']) ?>
                    <form action="" method="post" style="display:inline;">
                        <input type="hidden" name="remove_index" value="<?= $index ?>">
                        <button type="submit">Удалить</button>
                    </form>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php else: ?>
        <p>Корзина пуста.</p>
    <?php endif; ?>
</body>
</html>
