var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.set("views engine","ejs");

app.get('/',(req,res)=>{
	res.render('index.ejs');
})
app.get('/login',(req,res)=>{
	res.render('login.ejs');
})
app.get('/register',(req,res)=>{
	res.render('register.ejs');
})
app.get('/fare',(req,res)=>{
	res.render('fare.ejs');
})
app.get('/timetable',(req,res)=>{
	res.render('timetable.ejs');
})
app.get('/contact',(req,res)=>{
	res.render('contact.ejs');
})

app.listen(8080,()=> console.log("listening at 8080"));
