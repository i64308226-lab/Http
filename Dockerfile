FROM ghcr.io/sagernet/sing-box:latest
COPY config.json /etc/sing-box/config.json
CMD ["run", "-c", "/etc/sing-box/config.json"]
