const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Тестирование сборки Windows...\n');

// Проверяем, что мы на Windows или используем кросс-компиляцию
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

console.log(`📋 Платформа: ${process.platform}`);
console.log(`🏗️  Архитектура: ${process.arch}\n`);

// Проверяем наличие необходимых инструментов
function checkRequirements() {
  console.log('🔍 Проверка требований...');
  
  try {
    // Проверяем Node.js
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    // Проверяем npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
    
    // Проверяем electron-builder
    const electronBuilderVersion = execSync('npx electron-builder --version', { encoding: 'utf8' }).trim();
    console.log(`✅ electron-builder: ${electronBuilderVersion}`);
    
    if (isWindows) {
      // Проверяем наличие Visual Studio Build Tools
      try {
        execSync('where cl', { encoding: 'utf8' });
        console.log('✅ Visual Studio Build Tools найдены');
      } catch (error) {
        console.log('⚠️  Visual Studio Build Tools не найдены (может потребоваться для нативных модулей)');
      }
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Ошибка проверки требований:', error.message);
    process.exit(1);
  }
}

// Функция для сборки
function buildWindows(arch = null) {
  const archFlag = arch ? ` --${arch}` : '';
  const archName = arch || 'все архитектуры';
  
  console.log(`🚀 Сборка для Windows (${archName})...`);
  
  try {
    const command = `npm run build && electron-builder --win${archFlag}`;
    console.log(`📝 Выполняем: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    console.log(`✅ Сборка для Windows (${archName}) завершена успешно!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка сборки для Windows (${archName}):`, error.message);
    return false;
  }
}

// Проверяем результаты сборки
function checkBuildResults() {
  console.log('📁 Проверка результатов сборки...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Папка dist не найдена');
    return;
  }
  
  const files = fs.readdirSync(distPath);
  const windowsFiles = files.filter(file => 
    file.includes('.exe') || 
    file.includes('.zip') && file.includes('win')
  );
  
  if (windowsFiles.length === 0) {
    console.log('❌ Windows файлы не найдены');
    return;
  }
  
  console.log('✅ Найденные Windows файлы:');
  windowsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   📦 ${file} (${sizeMB} MB)`);
  });
  
  console.log('');
}

// Основная функция
async function main() {
  try {
    checkRequirements();
    
    // Сборка для всех архитектур
    const success = buildWindows();
    
    if (success) {
      checkBuildResults();
      console.log('🎉 Тестирование сборки Windows завершено успешно!');
    } else {
      console.log('💥 Тестирование сборки Windows завершено с ошибками');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем тест
main();
