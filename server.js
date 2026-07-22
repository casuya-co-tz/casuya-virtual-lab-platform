const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/lib', express.static(path.join(__dirname, 'public', 'lib')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/three-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'three-demo.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
