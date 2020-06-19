var express = require('express');
var router = express.Router();

var conc = require('../connection');
router.get('/',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "user"){
			conc.query("select sId,sName from station",(err,stations,fields)=>{
	                res.render('./user/index.ejs',{stations : stations});
	        })			
		}
		else if(req.session.client == "admin"){
			res.redirect('/admin');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})

//user
router.get('/searchTrains/:params',(req,res)=>{
		if(req.session.ID){
			if(req.session.client == "user"){
		        var sts = req.params.params.toString().split("-");
		        var s_station = sts[0];
		        var e_station = sts[1];
		        conc.query("call trains(?,?)",[s_station,e_station],(err,result,fields)=>{
		                if(err) return;
		                var trains = result[0];
		                console.log(trains);
		                res.render('./user/searchResult.ejs',{trains : trains});
		        })				
			}
			else if(req.session.client == "admin"){
				res.redirect('/admin');
			}
			else{
				res.redirect('/logout');
			}
		}
		else{
			res.redirect('/');
		}

})

router.get('/fare',(req,res)=>{
		if(req.session.ID){
			if(req.session.client == "user"){
		        conc.query("select sId,sName from station",(err,stations,fields)=>{
		                        res.render('./user/fare.ejs',{stations : stations});
		        })				
			}
			else if(req.session.client == "admin"){
				res.redirect('/admin');
			}
			else{
				res.redirect('/logout');
			}
		}
		else{
			res.redirect('/');
		}
})
router.post('/fare',(req,res)=>{
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
router.get('/timetable',(req,res)=>{
		if(req.session.ID){
			if(req.session.client == "user"){
		        conc.query("select tId sId,tName sName from train",(err,stations,fields)=>{
		                        res.render('./user/timetable.ejs',{stations : stations});
		        })				
			}
			else if(req.session.client == "admin"){
				res.redirect('/admin');
			}
			else{
				res.redirect('/logout');
			}
		}
		else{
			res.redirect('/');
		}
})
router.get('/timetable/:params',(req,res)=>{
		if(req.session.ID){
			if(req.session.client == "user"){
		        var trainNo = req.params.params;
		        var get_time = "select s1.stop_count sNo, s2.sName as sName, s1.a_time aTime, s1.d_time dTime from schedule_stop s1, station s2 where s1.tId = ? and s1.sId = s2.sId order by sNo";
		        conc.query(get_time,[trainNo],(err,timetable,fields)=>{
		                res.render("./user/timetableResult.ejs",{timetable : timetable});
		        })				
			}
			else if(req.session.client == "admin"){
				res.redirect('/admin');
			}
			else{
				res.redirect('/logout');
			}
		}
		else{
			res.redirect('/');
		}
})

router.get('/contact',(req,res)=>{
		if(req.session.ID){
			if(req.session.client == "user"){
        res.render('./user/contact.ejs');				
			}
			else if(req.session.client == "admin"){
				res.redirect('/admin');
			}
			else{
				res.redirect('/logout')
			}
		}
		else{
			res.redirect('/');
		}

})
router.get('/masterCard',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "user"){
			var qry = "select * from masterCard where uId = ? and cStatus = 1;";
			conc.query(qry,[req.session.ID],(err,data)=>{
				if(err) return console.log(err);
				if(data.length == 0){
					res.render('./user/masterCard.ejs');
				}
				else{
					var card = data[0];
					console.log(card);
					res.render('./user/cardDetails.ejs',{card : card});
				}
			})
		}
		else if(req.session.client == "admin"){
			res.redirect('/admin');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})

router.post('/createMasterCard',(req,res)=>{
	var uId = req.session.ID;
	var part1 = 1000;
	var part2 = 1000;
	var part3 = 1000;
	var part4 = 1000;
	var qry1 = "select count(cId) count from masterCard;";
	var qry2 = "insert into masterCard(cId,cNo,cStatus,expDate,wallet,uId) values(?,?,?,?,?,?);"
	conc.query(qry1,(err,data)=>{
		if(err) return console.log(err);
		var cards = data[0].count;
		var cId = cards+1;
		part1 = part1+cards;
		if(part1 > 9999){
			part1 = 1000;
		}
		part2 = part2+cards+2;
		if(part1 > 9999){
			part1 = 1000;
		}
		part3 = part3+cards+3;
		if(part1 > 9999){
			part1 = 1000;
		}
		part4 = part4+cards+4;
		if(part1 > 9999){
			part1 = 1000;
		}
		var cNo = ""+part1+part2+part3+part4;
		conc.query(qry2,[cId,cNo,1,"2032-01-01",3000,uId],(err,sent)=>{
			if(err) throw err;
			else{
				res.send('Added successfully');
			}
		})
				
	})
})
/*
CREATE TABLE masterCard (
cId INT PRIMARY KEY NOT NULL,
cNo INT NOT NULL,
cStatus INT NOT NULL,
expDate DATE NOT NULL,
uId INT NOT NULL,
FOREIGN KEY(uId) REFERENCES user(uId));
*/
//logout
router.get('/logout',(req,res)=>{
        req.session.destroy((err,data)=>{
                res.redirect('/');
        })
})

module.exports = router;
