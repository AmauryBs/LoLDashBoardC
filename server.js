require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const controller = require(__dirname + '/controllers/summoner_controller')
let fs = require('fs');
let path = require('path');
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
let headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  'Access-Control-Max-Age': 2592000 // 30 days
};

app.use('/js',express.static(__dirname+'/www/js'));
app.use('/css',express.static(__dirname+'/www/css'));
app.use('/data',express.static(__dirname+'/www/data'));
app.use('/img',express.static(__dirname+'/www/img'));
app.use('/views',express.static(__dirname+'/views/'));


app.get('/summonerPage',function(req,res){
  res.render('pages/summonerPage.ejs',{username:''});
});

app.post('/summonerPage',(req,res) => { 
  controller.generateHTML(req,res);
});


app.get('/',(req,res) => {
    res.render("pages/index.ejs");
});

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('app listening on port 3000!')
})