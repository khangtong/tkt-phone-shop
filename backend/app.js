const path = require('path');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;
