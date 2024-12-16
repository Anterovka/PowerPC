window.addEventListener('load', function () {
  var preloader = document.getElementById('preloader');
  preloader.style.display = 'none';
});

// Функция для закрытия модального окна при клике вне его
function closeModalOnOutsideClick(modal) {
  modal.addEventListener('click', (event) => {
    // Проверяем, был ли клик на самом модальном окне (фоне)
    if (event.target === modal) {
      modal.close();
    }
  });
}



let cart = [];
let productData = {};
const API_URL = 'settings/get_computers.php';

// Утилиты для работы с cookies
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

// Загрузка данных о продуктах из API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных о продуктах');
        }
        const products = await response.json();
        productData = products.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {});
        console.log('Данные о продуктах загружены:', productData);
    } catch (error) {
        console.error('Ошибка при получении данных о продуктах:', error);
    }
}

// Добавление товара в корзину
function addToCart(id) {
    const product = productData[id];
    if (!product) {
        alert('Продукт не найден!');
        return;
    }

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }

    updateCartPopup();
    saveCartToCookies();
    updateCartCount();
}

// Удаление товара из корзины
function removeFromCart(id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== id);
        }
        updateCartPopup();
        saveCartToCookies();
        updateCartCount();
    }
}

// Обновление количества товаров в корзине
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalCount;
    cartCountElement.style.display = totalCount > 0 ? 'inline' : 'none';
}

// Сохранение корзины в cookies
function saveCartToCookies() {
    setCookie('cart', JSON.stringify(cart), 7);
}

// Загрузка корзины из cookies
function loadCartFromCookies() {
    const cartData = getCookie('cart');
    if (cartData) {
        cart = JSON.parse(cartData);
        updateCartPopup();
    }
}

// Обновление содержимого всплывающей корзины
function updateCartPopup() {
    const cartPopup = document.getElementById('cartPopup');
    const itemList = cartPopup.querySelector('.item-list');
    const cartContent = cartPopup.querySelector('p');

    if (cart.length > 0) {
        cartContent.innerHTML = '';
        itemList.innerHTML = ''; // Очищаем старый список

        let totalPrice = 0; // Общая стоимость товаров

        cart.forEach(item => {
            const product = productData[item.id];
            const itemTotalPrice = item.price * item.quantity; // Стоимость товара с учетом количества
            totalPrice += itemTotalPrice;

            const listItem = document.createElement('div');
            listItem.style.cssText = 'border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px; display: flex; align-items: center;';

            listItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: auto; margin-right: 10px;">
                <div style="flex-grow: 1;">
                    <span>${product.name}</span>
                    <div style="margin: 5px 10px; font-size: 12px; color: gray;">${product.price.toFixed(2)}₽ / шт</div>
                </div>
                <button class="remove-button" data-product="${product.name}" style="margin: 0 5px;">-</button>
                <span style="margin: 0 0px;">${item.quantity}</span>
                <button class="add-button" data-product="${product.name}" style="margin: 0 15px 0 5px;">+</button>
                <span>${itemTotalPrice.toFixed(2)}₽</span>
            `;

            itemList.appendChild(listItem);
        });

        // Общая стоимость
        const totalPriceElement = document.createElement('div');
        totalPriceElement.style.textAlign = 'left';
        totalPriceElement.innerHTML = `
            <strong style="font-size: 20px;">Итого: ${totalPrice.toFixed(2)}₽</strong>
        `;
        itemList.appendChild(totalPriceElement);

        // Обработчики событий для кнопок
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-product');
                removeFromCart(Object.keys(productData).find(key => productData[key].name === id));
            });
        });

        document.querySelectorAll('.add-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-product');
                addToCart(Object.keys(productData).find(key => productData[key].name === id));
            });
        });
    } else {
        cartContent.innerHTML = 'Корзина пуста.';
        itemList.innerHTML = '';
    }
}

// Отображение/скрытие всплывающего окна корзины
function toggleCartPopup() {
    const cartPopup = document.getElementById('cartPopup');
    const overlay = document.getElementById('overlay');

    cartPopup.style.display = cartPopup.style.display === 'none' ? 'block' : 'none';
    cartPopup.classList.toggle('show');
    overlay.classList.toggle('show');

    if (cartPopup.classList.contains('show')) {
        cartPopup.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        setTimeout(() => {
            cartPopup.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    }
}

// Закрытие корзины при клике на overlay
document.getElementById('overlay').addEventListener('click', toggleCartPopup);

// Добавление товара при клике на кнопку "Купить"
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy')) {
        const id = event.target.getAttribute('data-id');
        addToCart(id);
        alert(`Товар добавлен в корзину!`);
    }
});

async function sendOrderToTelegram(orderData) {
    const token = '7884580295:AAHHu0KLsy-bJGJy69idDPXjulBLK4kHd4s';
    const chatId = '-1002357337988';

    let message = `<b>Новый заказ:</b>\n`;
    message += `<b>Имя:</b> ${orderData.name}\n`;
    message += `<b>Email:</b> ${orderData.email}\n`;
    message += `<b>Адрес:</b> ${orderData.address}\n`;
    message += `<b>Товары:</b>\n<pre>======================`;
    orderData.items.forEach(item => {
        message += `\n<b>Название:</b> ${item.name}\n`;
        message += `<b>Количество:</b> ${item.quantity}\n`;
        message += `<b>Цена за шт:</b> ${item.price}₽\n`;
        message += `<b>Общая стоимость:</b> ${item.total}₽\n`;
        message += `======================\n`;
    });

    // Добавляем общую стоимость
    message += `<b>Итого:</b> ${orderData.totalPrice}₽</pre>`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML' 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при отправке сообщения в Telegram');
        }
        return response.json();
    })
    .then(data => {
        console.log('Сообщение отправлено в Telegram:', data);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}



// Функция для оформления заказа
async function checkout() {
    if (cart.length === 0) {
        alert("Ваша корзина пуста. Добавьте товары для оформления заказа.");
        return;
    }

    // Получаем данные покупателя
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerAddress = document.getElementById('customerAddress').value;

    if (!customerName || !customerEmail || !customerAddress) {
        alert("Пожалуйста, заполните все поля.");
        return;
    }

    // Проверка корректности email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customerEmail)) {
        alert("Пожалуйста, введите корректный email-адрес.");
        return;
    }

    // Формируем массив с данными о товарах из корзины
    const orderItems = cart.map(item => {
        const product = productData[item.id]; // Находим товар по id
        return {
            name: product ? product.name : 'Неизвестный товар',
            price: product ? product.price : 0,
            quantity: item.quantity,
            total: (product ? product.price : 0) * item.quantity,
            image: product ? product.image : ''
        };
    });

    // Общая стоимость заказа
    const totalPrice = orderItems.reduce((total, item) => total + item.total, 0);

    // Формируем объект заказа
    const orderData = {
        name: customerName,
        email: customerEmail,
        address: customerAddress,
        items: orderItems,
        totalPrice: totalPrice
    };

    // Отправляем заказ в Telegram
    await sendOrderToTelegram(orderData);
    
    // Очищаем корзину через 1 секунду и обновляем страницу
    setTimeout(() => {
        cart = []; // Сбрасываем массив корзины
        saveCartToCookies(); // Сохраняем пустую корзину в cookies
        updateCartCount(); // Обновляем счетчик товаров
        updateCartPopup(); // Обновляем содержимое всплывающей корзины

        // Обновляем страницу
        location.reload(); // Перезагружаем страницу
    }, 1000); // Задержка в 1 секунду

    alert('Ваш заказ успешно отправлен!');
}


// Функция для получения предложений адресов
function getAddressSuggestions(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            showSuggestions(data);
        })
        .catch(error => {
            console.error('Ошибка при получении адресов:', error);
        });
}

// Функция для отображения предложений
function showSuggestions(features) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    if (features.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    features.forEach(feature => {
        const address = feature.display_name; // Получаем полное название адреса
        const suggestionItem = document.createElement('li'); // Используем <li> для списка
        suggestionItem.className = 'autocomplete-suggestion';
        suggestionItem.textContent = address;
        suggestionItem.onclick = () => selectAddress(address);
        suggestions.appendChild(suggestionItem);
    });

    suggestions.style.display = 'block';
}

// Функция для выбора адреса
function selectAddress(address) {
    document.getElementById('customerAddress').value = address;
    const suggestions = document.getElementById('suggestions');
    suggestions.style.display = 'none';
}

// Обработчик события для ввода адреса
document.getElementById('customerAddress').addEventListener('input', function() {
    const query = this.value;
    if (query.length > 2) { // Начинаем поиск, если введено более 2 символов
        getAddressSuggestions(query);
    } else {
        const suggestions = document.getElementById('suggestions');
        suggestions.style.display = 'none'; // Скрываем предложения, если введено меньше 3 символов
    }
});


// Загрузка данных при загрузке страницы
window.onload = async function () {
    await fetchProducts(); // Загрузить продукты
    loadCartFromCookies(); // Загрузить корзину из cookies
    updateCartCount(); // Обновить счетчик товаров
};







////////////////////////////////ЛИСТАНИЕ ОТЗЫВОВ//////////////////////////////////
async function fetchReviews() {
    try {
        const response = await fetch('db.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reviews = await response.json();
        displayTestimonials(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
    }
}

function displayTestimonials(reviews) {
    const container = document.querySelector('.sagestim-lonials');
    const latestReviews = reviews.slice(-3).reverse();
    
    latestReviews.forEach(testimonial => {
        const reviewsDiv = document.createElement('div');
        reviewsDiv.className = 'vemotau-vokusipol';
        reviewsDiv.innerHTML = `
            <div class="testimonial">
                <center><div class="avatar">${testimonial.name.charAt(0)}</div></center>
                <div class="gecedanam">${testimonial.name}</div>
                <div class="apogered-gselected">
                    ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - testimonial.rating)}
                </div>
                <p>${testimonial.text}</p>
            </div>
        `;
        container.appendChild(reviewsDiv);
    });
}

// Прокрутка отзывов
function scrollReviews(direction) {
    const container = document.querySelector('.sagestim-lonials');
    const scrollAmount = container.offsetWidth / 3; // Прокрутка на 1/3 ширины контейнера
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Вызов функции для получения отзывов при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchReviews);



///////////////////////////////////////////////////////////////////////////////





///////////////////////////// ОТЗЫВЫ ////////////////////////////////////////
async function fetchReviews() {
    try {
        const response = await fetch('db.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reviews = await response.json();
        displayTestimonials(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
    }
    return;
}

function displayTestimonials(reviews) {
    const container = document.querySelector('.sagestim-lonials');
    // Получаем последние 3 отзыва и разворачиваем их
    const latestReviews = reviews.slice(-3).reverse();
    
    latestReviews.forEach(testimonial => {
        const reviewsDiv = document.createElement('div');
        reviewsDiv.className = 'vemotau-vokusipol';
        reviewsDiv.innerHTML = `
            <div class="testimonial">
                <center><div class="avatar">${testimonial.name.charAt(0)}</div></center>
                <div class="gecedanam">${testimonial.name}</div>
                <div class="apogered-gselected">
                    ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - testimonial.rating)}
                </div>
                <p>${testimonial.text}</p>
            </div>
        `;
        container.appendChild(reviewsDiv);
    });
}

// Вызов функции для получения отзывов при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchReviews);



////////////////////////////////ЛИСТАНИЕ ПК/////////////////////////////////////////////

// Функция для получения данных о компьютерах
async function fetchComputers() {
    try {
        const response = await fetch('settings/get_computers.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const computers = await response.json();
        displayComputers(computers);
    } catch (error) {
        console.error('Ошибка при получении компьютеров:', error);
    }
}

// Функция для отображения компьютеров
function displayComputers(computers) {
    const container = document.getElementById('scrollContainer');
    container.innerHTML = '';

    computers.forEach(computer => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <button id="openBtn${computer.id}" class="buttonhunt">
                <img src="${computer.image}" class="comps" alt="${computer.name}">
            </button>
            <figcaption>${computer.name}</figcaption>
        `;
        container.appendChild(figure);
    });
}

// Функция для прокрутки контейнера
function scrollComputers(direction) {
    const container = document.getElementById('scrollContainer');
    const scrollAmount = container.offsetWidth / 3; // Прокрутка на 1/3 ширины контейнера
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Привязка событий к кнопкам прокрутки
document.getElementById('scrollLeft').addEventListener('click', () => scrollComputers(-1));
document.getElementById('scrollRight').addEventListener('click', () => scrollComputers(1));

// Вызов функции для получения компьютеров при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchComputers);






////////////////////////////////////////////////////////////////////////////////////




///////////////////////////// ПК ////////////////////////////////////////
async function fetchComputers() {
    try {
        const response = await fetch('settings/get_computers.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const computers = await response.json();
        displayComputers(computers);
    } catch (error) {
        console.error('Ошибка при получении компьютеров:', error);
    }
}

function displayComputers(computers) {
    const container = document.getElementById('scrollContainer');
    container.innerHTML = '';

    computers.forEach(computer => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <button id="openBtn${computer.id}" class="buttonhunt">
                <img src="${computer.image}" class="comps" alt="${computer.name}">
            </button>
            <figcaption>${computer.name}</figcaption>
        `;
        container.appendChild(figure);
    });
}

document.addEventListener('DOMContentLoaded', fetchComputers);


/////////////////////////////////////////////////////////////////////////////////


async function fetchComputers() {
    try {
        const response = await fetch('settings/get_computers.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const computers = await response.json();
        console.log(computers)
        displayComputers(computers);
    } catch (error) {
        console.error('Ошибка при получении компьютеров:', error);
    }
}

function displayComputers(computers) {
    const container = document.getElementById('scrollContainer');
    container.innerHTML = '';

    computers.forEach(computer => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <button id="openBtn${computer.id}" class="buttonhunt">
                <img src="${computer.image}" class="comps" alt="${computer.name}">
            </button>
            <figcaption>${computer.name}</figcaption>
        `;
        container.appendChild(figure);

        createModal(computer);
        
        document.getElementById(`openBtn${computer.id}`).addEventListener('click', () => {
            openModal(computer.id);
        });
        document.getElementById(`openBtn${computer.id}`).addEventListener('touchstart', () => {
            openModal(computer.id);
        });
        
    });
}

function createModal(computer) {
    const modalsContainer = document.getElementById('modalsContainer');
    const modal = document.createElement('dialog');
    modal.id = `modal${computer.id}`;
    modal.className = 'modal';

    // Генерация HTML для компонентов
    const componentsHTML = computer.components && Array.isArray(computer.components)
        ? computer.components.map(component => `
            <div class="component">
                ${component}
            </div>
        `).join('')
        : '<div>Нет доступных компонентов</div>'; 

    modal.innerHTML = `
        <div class="modal-content">
            <h2>${computer.name || 'Название не указано'}</h2>
            <img src="${computer.image || 'default-image.png'}" height="60%" width="50%">
            <div class="price">
                <strong>${computer.price || 'Цена не указана'} ₽</strong>
            </div>
            <div class="components">
                ${componentsHTML}
            </div>
            <br>
            <button class="cls" onclick="closeModal(${computer.id})">Закрыть</button>
            <button class="buy" data-product="${computer.name || 'Товар не указан'}" data-price="${computer.price || 0}" data-image="${computer.image || 'default-image.png'}" data-id="${computer.id}">Добавить в корзину</button>
        </div>
    `;
    modalsContainer.appendChild(modal);
}




function openModal(id) {
    const modal = document.getElementById(`modal${id}`);
    if (modal) {
        modal.showModal();
    }
}

function closeModal(id) {
    const modal = document.getElementById(`modal${id}`);
    if (modal) {
        modal.close();
    }
}

// Fetch computers when the page loads
document.addEventListener('DOMContentLoaded', fetchComputers);