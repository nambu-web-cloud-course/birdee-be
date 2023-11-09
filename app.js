const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const diary_router = require('./routers/diary_router');
const auth_router = require('./routers/auth_router');

dotenv.config();
const sync = require('./models/sync');
sync();

const port = process.env.PORT || 3000;
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello App.js');
});

app.use('/auth', auth_router);
app.use('/diaries', diary_router);

app.listen(port, () => {
    console.log(`Server Listening at ${port}`);
});