var express = require('express');
var session = require('express-session');
var app = express();

const bodyParser = require('body-parser');
var path = require('path')
app.use(bodyParser.urlencoded({ extended: true }));


const mysql = require('mysql');
var conc = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vara",
  database: "mydb"
});

conc.connect(function(err) {
  if (err) throw err;
  console.log("mysql Connected!");
});


app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: false
}));

app.use(express.static(__dirname + '/public'));
app.set("views engine","ejs");

app.get('/',(req,res)=>{
	conc.query("select sId,sName from station",(err,stations,fields)=>{	
		res.render('index.ejs',{stations : stations});
	})
	
})

app.get('/searchTrains/:params',(req,res)=>{
	var sts = req.params.params.toString().split("-");
	var s_station = sts[0];
	var e_station = sts[1];
	conc.query("call trains(?,?)",[s_station,e_station],(err,result,fields)=>{
		if(err) return;
		var trains = result[0];
		console.log(trains);
		res.render('searchResult.ejs',{trains : trains});
	})
	
})

app.get('/login',(req,res)=>{
	res.render('login.ejs');
})
app.get('/register',(req,res)=>{
	res.render('register.ejs');
})
app.get('/fare',(req,res)=>{
	conc.query("select sId,sName from station",(err,stations,fields)=>{		
			res.render('fare.ejs',{stations : stations});
	})
})
app.post('/fare',(req,res)=>{
	var s_station = req.body.ss;
	var e_station = req.body.es;
	conc.query("call cost(?,?)",[s_station,e_station],(err,result,field)=>{
		if(err) res.send("error");
		else{
			var cost = result[0][0].cost.toString();
			console.log(cost);
			res.send(cost);
		}
	})
})
app.get('/timetable',(req,res)=>{
	conc.query("select tId sId,tName sName from train",(err,stations,fields)=>{		
			res.render('timetable.ejs',{stations : stations});
	})
})
app.get('/timetable/:params',(req,res)=>{
	var trainNo = req.params.params;
	var get_time = "select s1.stop_count sNo, s2.sName as sName, s1.a_time aTime, s1.d_time dTime from schedule_stop s1, station s2 where s1.tId = ? and s1.sId = s2.sId order by sNo";
	conc.query(get_time,[trainNo],(err,timetable,fields)=>{
		res.render("timetableResult.ejs",{timetable : timetable});
	})
})

app.get('/contact',(req,res)=>{
	res.render('contact.ejs');
})

app.listen(8081,()=> console.log("listening at 8081"));
