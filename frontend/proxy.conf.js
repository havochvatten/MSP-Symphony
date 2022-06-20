const TARGETS_CONFIG = {
  remote: {
    host: 'https://myserver:8443',
  },
  local: {
    host: 'https://localhost:8443',
  },
};

const targets = TARGETS_CONFIG[process.env.PROXY_TARGET ?? 'remote'];
const PROXY_CONFIG = {
  "/symphony-ws/service/*": {
    "target": targets.host,
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
};

module.exports = PROXY_CONFIG;
