var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: "NoReply.MetroRail@gmail.com",
    pass: "Shiva3638#"
  }
});

module.exports = transport ;
