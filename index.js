const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const helmet = require('helmet');

dotenv.config();

const app = express();

const pagesRoutes = require('./routes/pages-routes');
const indexRoutes = require('./routes/index-routes');

app.use(helmet({ contentSecurityPolicy: false,crossOriginEmbedderPolicy: false}))
app.use(cors())
app.use('/cdn',express.static('public'));
app.set('view engine', 'pug');

app.use('/', pagesRoutes);
app.use('/index', indexRoutes);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        error: {
            status: err.status || 500,
            message: err.message || "Internal Server Error"
        }
    });
});

app.listen(process.env.PORT,() => console.log(`OdO Refined listening on port ${process.env.PORT}!`));
