var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  host: "gmail",
  auth: {
    user: "1a2b3c4d5e6f7g",
    pass: "1a2b3c4d5e6f7g"
  }
});

module.exports = transport ;
