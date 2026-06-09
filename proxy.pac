// Переменная для хранения скачанных сайтов, чтобы не качать файл при каждом клике
var cached_blocked_sites = null;

function getBlockedSites() {
    if (cached_blocked_sites !== null) {
        return cached_blocked_sites;
    }

    try {
        // Твоя прямая RAW ссылка на список доменов на GitHub
        var url = "https://raw.githubusercontent.com/i64308226-lab/my-dns-config/4f91298fdcc307f3cfe7ddac23ae27c27684c1be/dns-list.txt";
        
        // Синхронный запрос для получения текста файла
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false); 
        xhr.send();

        if (xhr.status === 200) {
            // Разбиваем текст файла по строкам, убираем пустые строки и пробелы
            var lines = xhr.responseText.split(/\r?\n/);
            cached_blocked_sites = lines.map(function(line) {
                return line.trim();
            }).filter(function(line) {
                return line.length > 0 && !line.startsWith("#"); // Игнорируем комментарии
            });
            return cached_blocked_sites;
        }
    } catch (e) {
        // Если гитхаб недоступен, возвращаем пустой список, чтобы интернет не падал
    }

    return [];
}

function FindProxyForURL(url, host) {
    var blocked_sites = getBlockedSites();

    // Проверяем, совпадает ли текущий хост с доменами из твоего dns-list.txt
    for (var i = 0; i < blocked_sites.length; i++) {
        var site = blocked_sites[i];
        if (dnsDomainIs(host, site) || shExpMatch(host, "*." + site)) {
            // Сюда по-прежнему подставляешь локальный IP своего запущенного ПК с sing-box
            return "PROXY 192.168.1.45:8080";
        }
    }

    // Все остальные сайты идут без прокси напрямую
    return "DIRECT";
}
