const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use('/api', createProxyMiddleware({ target: 'https://pwa.zrhq874.com', changeOrigin: true }));
  app.use(
    '/public',
    createProxyMiddleware({ target: 'https://pwa.zrhq874.com', changeOrigin: true }),
  );
};
