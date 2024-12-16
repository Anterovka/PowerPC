<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Подключаем автозагрузчик Composer

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true); // Создаем экземпляр PHPMailer

    try {
        // Настройки сервера
        $mail->isSMTP(); // Устанавливаем использование SMTP
        $mail->Host = 'ssl://smtp.timeweb.ru'; // Укажите адрес SMTP-сервера
        $mail->SMTPAuth = true; // Включаем аутентификацию SMTP
        $mail->Username = 'contact@power-pc.fun'; // Ваш логин
        $mail->Password = 'Anton1234'; // Ваш пароль
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Включаем шифрование TLS
        $mail->Port = 465; // Порт для подключения

        // Получатели
        $mail->setFrom('contact@power-pc.fun', 'Mailer'); // От кого
        $mail->addAddress($to); // Кому

        // Контент
        $mail->isHTML(true); // Устанавливаем формат HTML
        $mail->Subject = $subject; // Тема письма
        $mail->Body    = $body; // Тело письма

        $mail->send(); // Отправляем письмо
        echo 'Письмо отправлено';
    } catch (Exception $e) {
        echo "Ошибка при отправке письма: {$mail->ErrorInfo}";
    }
}

// Пример использования
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = $_POST['email']; // Получаем email из формы
    $subject = 'Ваш заказ'; // Тема письма
    $body = 'Спасибо за ваш заказ!'; // Тело письма

    sendEmail($to, $subject, $body);
}
?>
