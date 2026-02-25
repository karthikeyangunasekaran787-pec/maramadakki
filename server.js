const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// serve the static site from current directory
app.use(express.static(path.join(__dirname)));

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { newsItems: [], galleryItems: [], videoUrl: '' };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write data.json', e);
  }
}

app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const payload = req.body;
  if (typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  writeData(payload);
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});