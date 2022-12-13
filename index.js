const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();

const pagesRoutes = require('./routes/pages-routes');
const indexRoutes = require('./routes/index-routes');

app.use(helmet())
app.use('/cdn',express.static('public'));
app.set('view engine', 'pug');

app.use('/', pagesRoutes);
app.use('/index', indexRoutes);

app.listen(process.env.PORT,() => console.log(`OdO Refined listening on port ${process.env.PORT}!`));