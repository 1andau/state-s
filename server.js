const WebSocket = require('ws');
const axios = require('axios');
require('dotenv').config({ path: '.env' }); // Явно укажите путь к файлу


// Проверка env-переменных
if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
  console.error('❌ Error: Missing Cloudflare credentials in environment variables');
  process.exit(1);
}

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CHECK_INTERVAL = 15000;
let cachedVideos = [];

// Создаём WebSocket-сервер
const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ WebSocket server started on ws://localhost:8080");

// Функция для запроса видео с Cloudflare
const fetchVideos = async () => {
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?per_page=100`,
      { 
        headers: { 
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result.map(video => ({
      ...video,
      thumbnail: `https://customer-b7p449dj2tzggbg3.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`,
    }));
  } catch (error) {
    console.error('❌ Cloudflare API error:', error.response?.data || error.message);
    return null;
  }
};

// Проверяем обновления и рассылаем клиентам
const checkForUpdates = async () => {
  const videos = await fetchVideos();
  if (!videos) return; // Если ошибка при запросе

  const changedVideos = videos.filter((video, index) => {
    return !cachedVideos[index] || cachedVideos[index].readyToStream !== video.readyToStream;
  });

  if (changedVideos.length > 0 || cachedVideos.length === 0) {
    cachedVideos = videos;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: cachedVideos.length ? 'UPDATE_VIDEOS' : 'INITIAL_VIDEOS',
          videos: cachedVideos 
        }));
      }
    });
    console.log(`🔄 Sent ${cachedVideos.length} videos to clients`);
  }
};


// Обработка подключений клиентов
wss.on('connection', (ws) => {
  console.log("🔌 New client connected");
  
  // Отправляем текущие видео новому клиенту
  if (cachedVideos.length) {
    ws.send(JSON.stringify({ 
      type: 'INITIAL_VIDEOS', 
      videos: cachedVideos 
    }));
  }

  ws.on('close', () => {
    console.log("❌ Client disconnected");
  });
});

// Первая проверка при запуске
checkForUpdates();

// Периодическая проверка
setInterval(checkForUpdates, CHECK_INTERVAL);


wss.on('connection', (ws) => {
  console.log("🔌 New client connected");
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === "NEW_VIDEO") {
      // Добавляем новое видео в кэш
      cachedVideos.unshift(data.video);
      // Рассылаем всем клиентам
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "UPDATE_VIDEOS",
            videos: [data.video]
          }));
        }
      });
    }
  });
});