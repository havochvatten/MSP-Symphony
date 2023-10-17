const TARGETS_CONFIG = {
  remote: {
    host: 'https://myserver:8443',
  },
  local: {
    host: 'https://127.0.0.1:8443',
  },
};

const targets = TARGETS_CONFIG[process.env.PROXY_TARGET ?? 'remote'];
const PROXY_CONFIG = {
  "/symphony-ws/service/*": {
    "target": targets.host,
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  },
  "/socket": {
    "target": targets.host,
    "pathRewrite": {'^/socket' : '/symphony-ws'},
    "secure": false,
    "ws": true
  }
};

module.exports = PROXY_CONFIG;
