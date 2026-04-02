const API_KEY = 'a95a50822aa917e66ee9b03c4351e50baa42b187088c945539777a0685e5eca3'; 
let allCoins = [];
let myChart = null;

window.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initNavigation();
    fetchMarketData();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `section-${target}`) s.classList.add('active');
            });
        });
    });
}

// ГЛАВНАЯ ФУНКЦИЯ: Обход блокировок через прокси
async function fetchMarketData() {
    const grid = document.getElementById('cryptoGrid');
    try {
        const targetUrl = `https://cryptocompare.com{API_KEY}`;
        
        // Используем прокси-сервер, который разрешен в РФ и обходит CORS
        const response = await fetch(`https://allorigins.win{encodeURIComponent(targetUrl)}`);
        
        if (!response.ok) throw new Error('Сервер данных недоступен');
        
        const proxyData = await response.json();
        const result = JSON.parse(proxyData.contents); // Декодируем данные из прокси

        if (result.Response === "Error") throw new Error(result.Message);

        allCoins = result.Data.map(item => ({
            id: item.CoinInfo.Name,
            symbol: item.CoinInfo.Name,
            name: item.CoinInfo.FullName,
            image: `https://cryptocompare.com${item.CoinInfo.ImageUrl}`,
            price: item.RAW?.USD.PRICE || 0,
            change: item.RAW?.USD.CHANGEPCT24HOUR || 0,
            cap: item.RAW?.USD.MKTCAP || 0
        }));

        renderDashboard();
        renderMarketTable();
        if (allCoins.length > 0) updateChart(allCoins[0]);

    } catch (error) {
        console.error("Ошибка:", error);
        grid.innerHTML = `<div class="loader" style="color: #ef4444;">Ошибка загрузки. Попробуйте обновить страницу.</div>`;
    }
}

function renderDashboard() {
    const grid = document.getElementById('cryptoGrid');
    if(!grid) return;
    grid.innerHTML = allCoins.slice(0, 8).map(coin => `
        <div class="coin-card" onclick="selectCoin('${coin.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <img src="${coin.image}" width="40" height="40" style="border-radius:50%">
                <span style="color: ${coin.change > 0 ? '#10b981' : '#ef4444'}; font-weight:800;">
                    ${coin.change > 0 ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%
                </span>
            </div>
            <p style="color:var(--text-grey); font-size:12px; font-weight:700;">${coin.symbol}</p>
            <h3 style="font-size:22px;">$${coin.price.toLocaleString()}</h3>
        </div>
    `).join('');
}

function renderMarketTable() {
    const tableBody = document.getElementById('marketTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = allCoins.map(coin => `
        <tr>
            <td style="display:flex; align-items:center; gap:12px; padding: 20px;">
                <img src="${coin.image}" width="28"> 
                <div><b>${coin.symbol}</b></div>
            </td>
            <td>$${coin.price.toLocaleString()}</td>
            <td style="color:${coin.change > 0 ? '#10b981' : '#ef4444'}">${coin.change.toFixed(2)}%</td>
            <td>$${(coin.cap / 1e9).toFixed(2)}B</td>
        </tr>
    `).join('');
}

function selectCoin(symbol) {
    const coin = allCoins.find(c => c.symbol === symbol);
    if (coin) {
        document.getElementById('chartTitle').innerText = `${coin.name} Trend`;
        updateChart(coin);
    }
}

function updateChart(coin) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const dataPoints = Array.from({length: 15}, () => coin.price * (0.98 + Math.random() * 0.04));
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.map((_, i) => i),
            datasets: [{
                data: dataPoints, borderColor: '#6366f1', borderWidth: 4, tension: 0.4, fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)', pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function toggleAi() { document.getElementById('aiChatWindow').classList.toggle('active'); }
