// 1. ИНИЦИАЛИЗАЦИЯ
let myChart = null;

window.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initNavigation();
    initClock();
    fetchWeather();
    renderQuickQuestions();
});

// 2. НАВИГАЦИЯ (Все кнопки работают!)
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `section-${target}`) s.classList.add('active');
            });
            document.getElementById('sidebar').classList.remove('mobile-open');
        };
    });

    const menuBtn = document.getElementById('menuBtn');
    if(menuBtn) menuBtn.onclick = () => document.getElementById('sidebar').classList.toggle('mobile-open');
}

// 3. ЖИВЫЕ ЧАСЫ ДЛЯ ЛК И ШАПКИ
function initClock() {
    const timeEl = document.getElementById('liveTime');
    setInterval(() => {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
}

// 4. ПОЛУЧЕНИЕ ПОГОДЫ (Open-Meteo - работает в РФ)
async function fetchWeather() {
    try {
        // Запрос для Москвы (можно заменить на авто-геолокацию)
        const res = await fetch('https://open-meteo.com');
        const data = await res.json();
        
        const current = data.current_weather;
        document.getElementById('currentTemp').innerText = `${Math.round(current.temperature)}°`;
        document.getElementById('val-humidity').innerText = `${data.hourly.relative_humidity_2m[0]}%`;
        document.getElementById('val-wind').innerText = `${current.windspeed} км/ч`;
        
        initChart(data.hourly.temperature_2m.slice(0, 24));
    } catch (e) {
        console.error("Ошибка погоды");
    }
}

// 5. ГРАФИК
function initChart(temps) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                data: temps,
                borderColor: '#38bdf8',
                borderWidth: 5,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(56, 189, 241, 0.1)',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { grid: { display: false } } }
        }
    });
}

// 6. NOLLY AI: 7 ВОПРОСОВ И ОТВЕТОВ
const aiResponses = {
    "одежда": "Сегодня идеально подойдет легкая ветровка и джинсы. Не забудь солнечные очки! 😎",
    "дождь": "Мои датчики показывают 0% вероятности осадков. Зонт можно оставить дома! ☂️",
    "прогулка": "Конечно! Сейчас лучший индекс свежести воздуха для прогулки в парке. 🌳",
    "спорт": "Отличное время для пробежки. Ветер умеренный, дышится легко! 🏃",
    "загар": "УФ-индекс в норме, но после 12:00 лучше использовать защитный крем. ☀️",
    "завтра": "Завтра будет на 2 градуса теплее. Настоящая весна продолжается! 🌸",
    "привет": "Привет! Я Nolly. Я знаю всё о циклонах и антициклонах. Чем помочь? ☁️"
};

function renderQuickQuestions() {
    const aiWindow = document.getElementById('aiWindow');
    const qDiv = document.createElement('div');
    qDiv.className = 'quick-questions';
    
    const questions = [
        {txt: "Что надеть?", key: "одежда"},
        {txt: "Будет дождь?", key: "дождь"},
        {txt: "Можно гулять?", key: "прогулка"},
        {txt: "Как для спорта?", key: "спорт"},
        {txt: "Можно загорать?", key: "загар"},
        {txt: "Погода завтра?", key: "завтра"},
        {txt: "Кто ты?", key: "привет"}
    ];

    questions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'q-btn';
        btn.innerText = q.txt;
        btn.onclick = () => handleAiInput(q.key);
        qDiv.appendChild(btn);
    });
    aiWindow.insertBefore(qDiv, document.querySelector('.ai-footer'));
}

function toggleAi() { document.getElementById('aiWindow').classList.toggle('active'); }

function handleAiInput(key) {
    const box = document.getElementById('aiMessages');
    const response = aiResponses[key] || "Я пока только учусь понимать этот мир погоды... 🌍";
    
    box.innerHTML += `<div class="msg user">${key}</div>`;
    setTimeout(() => {
        box.innerHTML += `<div class="msg bot">${response}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
}

document.getElementById('aiSend').onclick = () => {
    const input = document.getElementById('aiInput');
    if(input.value) {
        handleAiInput(input.value.toLowerCase());
        input.value = '';
    }
};
