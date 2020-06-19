var express = require('express');
var session = require('express-session');
var app = express();

const bodyParser = require('body-parser');
var path = require('path')
app.use(bodyParser.urlencoded({ extended: true }));


const mysql = require('mysql');
var conc = require('./connection');

conc.connect(function(err) {
  if (err) throw err;
  console.log("mysql Connected!");
});

var transport = require('./mail');

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
		res.render('searchResult.ejs',{trains : trains});
	})
	
})

app.get('/login',(req,res)=>{
	res.render('login.ejs');
})

app.post('/loginCheck',(req,res)=>{
	var userName = req.body.u;
	var password = req.body.p;
	if(userName == "admin"){
			var adminqry = "select aId from admin where aId = ? and aPassword = ?;";
			conc.query(adminqry,[1,password],(err,result)=>{
				if(err) return console.log(err);
				if(result.length != 0){
				var admin = result[0];
				req.session.ID = admin.aId;
				req.session.client = "admin";
				res.send("Success");
				}
				else{
				res.send("failed");
				}
			})
	}
	else{
		var qry = "select uId from user where email = ? and uPassword = ?";
		conc.query(qry,[userName,password],(err,validUser)=>{
			if(err) res.send("failed");
			else{
				if(validUser.length != 0){
					req.session.ID = validUser[0].uId;
					req.session.client = "user";
					res.send("Success");
				}
				else{
					res.send("no user found .. check again");
				}
				
			}
		})
	}
})
//user
var user = require('./routes/user');
app.use('/user',user);
//admin
var admin = require('./routes/admin');
app.use('/admin',admin);
app.get('/register',(req,res)=>{
	res.render('rg.ejs');
})
app.post('/register',(req,res)=>{
	var name = req.body.n;
	var email = req.body.e;
	var pwssd = req.body.ps;
	var phone = req.body.p;
	var check = "select uId from user where email = ?;";
	var qry1 = "select count(uId) count from user;";
	var qry = "insert into user(uid,uName,mobile,email,uPassword) values(?,?,?,?,?);";
	conc.query(check,[email],(err,usr)=>{
		if(err) return res.send('falied');
		if(usr.length != 0){
			res.send("already user exists with this email");
		}
		else{
			conc.query(qry1,(err,total)=>{
				var id = total[0].count + 1;
				conc.query(qry,[id,name,phone,email,pwssd],(err,data)=>{
					if(err) throw err;
					else{

					    	var mailOptions = {
					      from: 'NoReply.MetroRail@gmail.com',
					      to: email,
					      subject: 'Successfully registered to Metro Account',
					      
					      html: '<h1>Thanks for registering</h1>',
					    };
					     
					    transport.sendMail(mailOptions, (error, info) => {
					      if (error) {
					        return console.log(error);
					      }
					      console.log('Email sent: ' + info.response);
					    });
						res.send("Success");
					}
				})
			})
		}
	})
	/*
	CREATE TABLE user (
	uId INT PRIMARY KEY NOT NULL,
	uName VARCHAR (50) NOT NULL,
	uDob DATE,
	uSex CHAR (1),
	mobile INT,
	email VARCHAR (50) NOT NULL,
	uPassword VARCHAR (15) NOT NULL);
	*/
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
