const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const diary_router = require('./routers/diary_router');
const page_router = require('./routers/page_router');
const auth_router = require('./routers/auth_router');
const category_router = require('./routers/category_router');
const cors = require('cors');

dotenv.config();
const sync = require('./models/sync');
sync();

const port = process.env.PORT || 3000;
const app = express();

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello App.js');
});

app.use('/auth', auth_router);
app.use('/diaries/:diary_id/pages', page_router);
app.use('/diaries', diary_router);
app.use('/category', category_router);

app.listen(port, () => {
    console.log(`Server Listening at ${port}`);
});