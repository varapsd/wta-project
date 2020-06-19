var express = require('express');
var router = express.Router();

var conc = require('../connection');
var transport = require('../mail');
router.get('/',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "admin"){
			res.render('./admin/index.ejs');
		}
		else if(req.session.client == "user"){
			res.redirect('/user');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})

router.get('/trainList',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "admin"){
			var qry = "select t.tId, s1.sName sst, s2.sName est from train t, station s1, station s2 where t.s_station = s1.sId and t.e_station = s2.sId;";
			conc.query(qry,(err,trains)=>{
				if(err) return console.log(err);
				res.render('./admin/trainList.ejs',{ trains : trains });
			})
		}
		else if(req.session.client == "user"){
			res.redirect('/user');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})

router.get('/stationList',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "admin"){
			var qry = "select sId, sName from station;";
			conc.query(qry,(err,stations)=>{
				if(err) return console.log(err);
				res.render('./admin/stationList.ejs',{ stations : stations });
			})
		}
		else if(req.session.client == "user"){
			res.redirect('/user');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})

router.get('/userList',(req,res)=>{
	if(req.session.ID){
		if(req.session.client == "admin"){
			var qry = "select u.uId uId, u.uName uName, u.mobile mobile, c.wallet wallet from user u left join masterCard c on u.uId = c.uId;";
			conc.query(qry,(err,users)=>{
				if(err) return console.log(err);
				res.render('./admin/userList.ejs',{ users : users });
			})
		}
		else if(req.session.client == "user"){
			res.redirect('/user');
		}
		else{
			res.redirect('/logout');
		}
	}
	else{
		res.redirect('/');
	}
})
router.get('/logout',(req,res)=>{
        req.session.destroy((err,data)=>{
                res.redirect('/');
        })
})

module.exports = router;
