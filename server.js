const app = require('./dev-server');

const port = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

module.exports = app;
