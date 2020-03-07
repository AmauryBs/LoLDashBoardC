require('dotenv').config()
request=require('request')



function generateHTML(req, res) {
requestProfile(req.body.name, function(result){
  
  var id = result.id
  var data = result
  requestRanked(id, function(result){
    var obj = Object.assign(data, {'ranked':result})
    console.log(obj)
    res.render('pages/summonerPage',obj);
  });

});
  }


function requestProfile(name, callback){
  url= encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+name+'?api_key=RGAPI-a53cf9ca-0bf1-4ab3-8b0a-dbf1bbed07e8');
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    
    var val= JSON.parse(body);
  }else{
    var val =JSON.parse({name:'', summonerLevel:-1,profileIconId:-1});
  }
  callback(val);
});
}

function requestRanked(id, callback){
  url= encodeURI('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=RGAPI-a53cf9ca-0bf1-4ab3-8b0a-dbf1bbed07e8');
  var val ={rank:'unranked'};
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var val= JSON.parse(body);
  }
  callback(val);
});
}

  module.exports.generateHTML = generateHTML;