// 1. Глобальные переменные
let allCoins = [];
let myChart = null;

window.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initNavigation();
    fetchMarketData();
});

// 2. Навигация (Оставляем без изменений)
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `section-${targetId}`) s.classList.add('active');
            });
            document.getElementById('sidebar').classList.remove('mobile-open');
        });
    });
    const menuBtn = document.getElementById('menuBtn');
    if(menuBtn) menuBtn.onclick = () => document.getElementById('sidebar').classList.toggle('mobile-open');
}

// 3. ПОЛУЧЕНИЕ ДАННЫХ (Используем CryptoCompare - стабильно в РФ)
async function fetchMarketData() {
    const grid = document.getElementById('cryptoGrid');
    try {
        // Запрос ТОП-20 монет по объему (бесплатный и открытый API)
        const res = await fetch('https://cryptocompare.com');
        const json = await res.json();
        
        // Преобразуем формат CryptoCompare в наш удобный формат
        allCoins = json.Data.map(item => ({
            id: item.CoinInfo.Name.toLowerCase(),
            symbol: item.CoinInfo.Name,
            name: item.CoinInfo.FullName,
            image: `https://www.cryptocompare.com${item.CoinInfo.ImageUrl}`,
            current_price: item.RAW.USD.PRICE,
            price_change_percentage_24h: item.RAW.USD.CHANGEPCT24HOUR,
            market_cap: item.RAW.USD.MKTCAP
        }));

        renderDashboard(allCoins);
        renderMarketTable(allCoins);
        
        if (allCoins.length > 0) updateChart(allCoins[0]);
    } catch (error) {
        console.error("API Error:", error);
        grid.innerHTML = "<div class='loader'>Ошибка загрузки. Попробуйте обновить страницу позже.</div>";
    }
}

// 4. Отрисовка карточек
function renderDashboard(data) {
    const grid = document.getElementById('cryptoGrid');
    grid.innerHTML = data.slice(0, 8).map(coin => `
        <div class="coin-card" onclick="selectCoin('${coin.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <img src="${coin.image}" width="40" height="40" style="border-radius:50%">
                <span style="color: ${coin.price_change_percentage_24h > 0 ? '#10b981' : '#ef4444'}; font-weight:800;">
                    ${coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
            </div>
            <p style="color:var(--text-grey); font-size:12px; font-weight:700;">${coin.symbol}</p>
            <h3 style="font-size:20px;">$${coin.current_price.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>
    `).join('');
}

// 5. Выбор монеты и график
function selectCoin(id) {
    const coin = allCoins.find(c => c.id === id);
    if(coin) {
        document.getElementById('chartTitle').innerText = `${coin.name} Trend`;
        updateChart(coin);
        showAiMessage(`Nolly: ${coin.name} сейчас торгуется по $${coin.current_price.toLocaleString()}.`);
    }
}

// 6. График (Заглушка, так как CryptoCompare требует доп. запрос для истории)
function updateChart(coin) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    // Генерируем случайные данные для вида, так как бесплатная история требует API ключа
    const dummyData = Array.from({length: 20}, () => coin.current_price * (0.95 + Math.random() * 0.1));
    const labels = dummyData.map((_, i) => i);

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: dummyData,
                borderColor: '#6366f1',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { grid: { color: '#f1f5f9' } } }
        }
    });
}

// Остальные функции (AI и т.д.) оставляем как были...
function toggleAi() { document.getElementById('aiChatWindow').classList.toggle('active'); }
function showAiMessage(t) {
    const b = document.getElementById('aiMessages');
    const d = document.createElement('div');
    d.className = 'msg bot'; d.innerText = t;
    b.appendChild(d); b.scrollTop = b.scrollHeight;
}
