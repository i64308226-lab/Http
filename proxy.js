const fs = require('fs');

async function fetchData() {
  try {
    // URL сайта или API, к которому нужен доступ
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
    const data = await response.json();
    
    // Добавляем метку времени, чтобы видеть, когда прокси обновлялся
    data.proxied_at = new Date().toISOString();

    // Сохраняем результат в файл для GitHub Pages
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('Данные успешно проксированы!');
  } catch (error) {
    console.error('Ошибка при запросе данных:', error);
    process.exit(1);
  }
}

fetchData();
