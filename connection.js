const mysql = require('mysql');
var conc = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vara",
  database: "mydb",
  dateStrings: 'date'
});

module.exports = conc;
