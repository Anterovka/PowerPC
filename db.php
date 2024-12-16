<?php
header('Content-Type: application/json');

$dbFile = 'settings/db.sqlite';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->query("SELECT * FROM reviews");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedreviews = array_map(function($testimonial) {
        return [
            'name' => $testimonial['name'],
            'rating' => (int)$testimonial['rating'],
            'text' => $testimonial['text']
        ];
    }, $reviews);

    echo json_encode($formattedreviews);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$db = null;
?>
