var express = require('express');
var app = express();
var mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();
const Sequelize = require('sequelize');
const morgan = require("morgan");

const cors = require('cors');

//allow cors
app.use(cors());
app.options('*', cors());

app.use(bodyParser.json({
  limit: '150mb',
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));
app.use(morgan("tiny"));

//sequelize DB Connection
const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  allowNull: true,
  query: { raw: true },
  pool: {
    max: 20,
    min: 10,
    acquire: 30000,
    idle: 10000
  }
});

global.sequelize = sequelize;
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, company_code");
  next();
});
require('./routes/index')(app, sequelize);

var server = app.listen(process.env.PORT, function () {
  console.log(`Server is running.. on port ${process.env.PORT}`);
});
