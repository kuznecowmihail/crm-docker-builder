const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createPNGIcon(size = 512) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Современный градиентный фон
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4f46e5'); // Индиго
  gradient.addColorStop(0.5, '#7c3aed'); // Фиолетовый
  gradient.addColorStop(1, '#ec4899'); // Розовый

  // Рисуем фон с закругленными углами
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.12);
  ctx.fill();

  // Добавляем внутреннюю тень
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = size * 0.02;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size * 0.01;

  // Рисуем Docker контейнер (более узнаваемый)
  const containerX = size * 0.15;
  const containerY = size * 0.2;
  const containerWidth = size * 0.7;
  const containerHeight = size * 0.4;

  // Основание контейнера (более широкое)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(containerX, containerY + size * 0.1, containerWidth, containerHeight, size * 0.03);
  ctx.fill();

  // Верхняя часть контейнера (более заметная)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(containerX, containerY, containerWidth, size * 0.1, size * 0.03);
  ctx.fill();

  // Крышка контейнера с градиентом (более яркая)
  const lidGradient = ctx.createLinearGradient(containerX, containerY, containerX + containerWidth, containerY);
  lidGradient.addColorStop(0, '#6366f1');
  lidGradient.addColorStop(1, '#8b5cf6');
  
  ctx.fillStyle = lidGradient;
  ctx.beginPath();
  ctx.roundRect(containerX + size * 0.02, containerY + size * 0.02, containerWidth - size * 0.04, size * 0.06, size * 0.025);
  ctx.fill();

  // Рисуем Docker логотип на крышке (более крупный)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = `bold ${size * 0.05}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐳', containerX + containerWidth * 0.5, containerY + size * 0.05);

  // Сбрасываем тени
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Рисуем CRM символы (более крупные и четкие)
  const usersX = size * 0.7;
  const usersY = size * 0.7;
  const userRadius = size * 0.04;

  // Фон для пользователей (более заметный)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(usersX - size * 0.03, usersY - size * 0.03, size * 0.22, size * 0.15, size * 0.025);
  ctx.fill();

  // Пользователи с градиентом (более яркие)
  const userGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, userRadius);
  userGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  userGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

  ctx.fillStyle = userGradient;
  
  // Пользователь 1 (более крупный)
  ctx.beginPath();
  ctx.arc(usersX + size * 0.05, usersY + size * 0.05, userRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Пользователь 2 (более крупный)
  ctx.beginPath();
  ctx.arc(usersX + size * 0.15, usersY + size * 0.05, userRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Пользователь 3 (более крупный)
  ctx.beginPath();
  ctx.arc(usersX + size * 0.1, usersY + size * 0.1, userRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Соединительные линии (более толстые и яркие)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = size * 0.012;
  ctx.lineCap = 'round';
  
  // Линия 1-3
  ctx.beginPath();
  ctx.moveTo(usersX + size * 0.05, usersY + size * 0.05);
  ctx.lineTo(usersX + size * 0.1, usersY + size * 0.1);
  ctx.stroke();

  // Линия 2-3
  ctx.beginPath();
  ctx.moveTo(usersX + size * 0.15, usersY + size * 0.05);
  ctx.lineTo(usersX + size * 0.1, usersY + size * 0.1);
  ctx.stroke();

  // Линия 1-2
  ctx.beginPath();
  ctx.moveTo(usersX + size * 0.05, usersY + size * 0.05);
  ctx.lineTo(usersX + size * 0.15, usersY + size * 0.05);
  ctx.stroke();

  // Добавляем декоративные элементы для лучшей читаемости
  // Маленькие точки вокруг контейнера
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const dotRadius = size * 0.008;
  
  // Точки в углах
  ctx.beginPath();
  ctx.arc(containerX - size * 0.02, containerY - size * 0.02, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(containerX + containerWidth + size * 0.02, containerY - size * 0.02, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(containerX - size * 0.02, containerY + containerHeight + size * 0.12, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(containerX + containerWidth + size * 0.02, containerY + containerHeight + size * 0.12, dotRadius, 0, 2 * Math.PI);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Создаем PNG иконки разных размеров
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
const iconsDir = path.join(__dirname, '..', 'electron', 'assets', 'icons');

// Создаем папку, если её нет
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Создаем PNG иконки разных размеров
sizes.forEach(size => {
  const pngBuffer = createPNGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, pngBuffer);
  console.log(`Создана PNG иконка: ${filename}`);
});

// Создаем основную иконку
const mainIconBuffer = createPNGIcon(512);
const mainIconPath = path.join(iconsDir, 'icon.png');
fs.writeFileSync(mainIconPath, mainIconBuffer);
console.log('Создана основная PNG иконка: icon.png');

console.log('\n🎨 Улучшенные PNG иконки созданы успешно!');
console.log('✨ Новый дизайн включает:');
console.log('   - Более крупные и четкие элементы');
console.log('   - Убран текст "CRM" для лучшей читаемости');
console.log('   - Более узнаваемый Docker контейнер');
console.log('   - Увеличенные пользователи CRM');
console.log('   - Декоративные элементы для лучшей видимости');
console.log('   - Оптимизировано для маленьких размеров');
console.log('Теперь иконка будет хорошо читаться на всех размерах!');
