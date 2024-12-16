let isDown = false;
let startX;
let scrollLeft;

const container = document.getElementById('scrollContainer');

// Обработчики для мыши
container.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
});

container.addEventListener('mouseleave', () => {
    isDown = false;
});

container.addEventListener('mouseup', () => {
    isDown = false;
});

container.addEventListener('mousemove', (e) => {
    if (!isDown) return; // если не нажата кнопка мыши
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // скорость прокрутки
    container.scrollLeft = scrollLeft - walk;
});

// Обработчики для сенсорных устройств
container.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].clientX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    e.preventDefault(); // предотвращаем прокрутку страницы
});

container.addEventListener('touchend', () => {
    isDown = false;
});

container.addEventListener('touchmove', (e) => {
    if (!isDown) return; // если не нажата кнопка
    e.preventDefault(); // предотвращаем прокрутку страницы
    const x = e.touches[0].clientX - container.offsetLeft;
    const walk = (x - startX) * 2; // скорость прокрутки
    container.scrollLeft = scrollLeft - walk;
});

document.getElementById('scrollLeft').addEventListener('click', function() {
    container.scrollBy({
        top: 0,
        left: -150, // Прокручиваем на 150 пикселей влево
        behavior: 'smooth' // Плавная прокрутка
    });
});

document.getElementById('scrollRight').addEventListener('click', function() {
    container.scrollBy({
        top: 0,
        left: 150, // Прокручиваем на 150 пикселей вправо
        behavior: 'smooth' // Плавная прокрутка
    });
});