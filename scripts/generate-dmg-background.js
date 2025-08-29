const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Создаем canvas для фона DMG
const width = 540;
const height = 380;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Градиентный фон
const gradient = ctx.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, '#2c3e50');
gradient.addColorStop(1, '#34495e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Добавляем текст
ctx.fillStyle = '#ecf0f1';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.fillText('CRM Docker Builder', width / 2, height / 2 - 20);

ctx.font = '16px Arial';
ctx.fillText('Перетащите приложение в папку Applications', width / 2, height / 2 + 20);

// Сохраняем изображение
const outputPath = path.join(__dirname, '../electron/assets/dmg-background.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`✅ Фон DMG создан: ${outputPath}`);
