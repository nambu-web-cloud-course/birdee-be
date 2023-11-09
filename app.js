const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello App.js');
});

app.listen(port, () => {
    console.log(`Server Listening at ${port}`);
});