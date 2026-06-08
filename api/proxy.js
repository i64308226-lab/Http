const httpProxy = require('http-proxy');
const { SocksProxyAgent } = require('socks-proxy-agent');
const net = require('net');
const tls = require('tls');

// Твой рабочий VLESS Reality ключ
const VLESS_CONFIG = {
  uuid: "b6c6f575-4494-4c7a-9b62-306ebdf16a71",
  server: "cdn.bushbaza.cc",
  port: 443,
  sni: "www.microsoft.com",
  pbk: "rvJys5mM4q2eBc5EOtHXAZ8QWAGZH2f4eUM1KmI2SXg",
  sid: "cf3e82c8ece6",
  flow: "xtls-rprx-vision"
};

const proxy = httpProxy.createProxyServer({ target: { socketPath: null } });

module.exports = async (req, res) => {
  try {
    // Логика обработки входящего HTTP запроса от Android и заворачивание его в TCP сокет к VLESS серверу
    const remoteUrl = new URL(req.url);
    
    // Подключаемся к удаленному VLESS серверу с поддержкой Reality/TLS
    const socket = tls.connect({
      host: VLESS_CONFIG.server,
      port: VLESS_CONFIG.port,
      servername: VLESS_CONFIG.sni,
      rejectUnauthorized: false // Для Reality кастомных сертификатов
    }, () => {
      // Простейший олдскульный VLESS-протокол хэндшейк (проверка UUID)
      const uuidBuffer = Buffer.from(VLESS_CONFIG.uuid.replace(/-/g, ''), 'hex');
      const addonLength = 0;
      const command = 1; // TCP
      
      const portBuffer = Buffer.alloc(2);
      portBuffer.writeUInt16BE(remoteUrl.port || 80);
      
      const hostBuffer = Buffer.from(remoteUrl.hostname);
      const hostLength = hostBuffer.length;

      const requestHeader = Buffer.concat([
        Buffer.from([0]), // Version 0
        uuidBuffer,
        Buffer.from([addonLength]),
        Buffer.from([command]),
        Buffer.from([hostLength]),
        hostBuffer,
        portBuffer
      ]);

      socket.write(requestHeader);
      
      // Связываем поток данных от Android с VLESS туннелем
      req.pipe(socket);
      socket.pipe(res);
    });

    socket.on('error', (err) => {
      res.writeHead(502);
      res.end('VLESS Tunnel Error');
    });

  } catch (error) {
    res.writeHead(500);
    res.end('Internal Gateway Error');
  }
};
