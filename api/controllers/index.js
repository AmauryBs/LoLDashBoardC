const { Template } = require('ejs');
const { version } = require('mongoose');
const models = require('../../schemas');

require('dotenv').config()
request=require('request')


headers = {
  "Origin": "https://developer.riotgames.com",
  "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Riot-Token": process.env.API_KEY,
}

function generateHTML(req, res) {
  if(req.body.name ==''){
    console.log('empty name')
    res.render('pages/summonerPage');
    return;
  }  
  models.Summoner.findOne({lowerName: req.body.name.toLowerCase()}, function (err, player){ 
    if(player){
      in_game(player.id, function(game){
        if (game != 'undefined' && game!= undefined) {
          gameType(game.gameQueueConfigId, function(queue){
            if(queue!=''){
              game.gameQueueConfigId = queue
            }
            player = Object.assign(player, {'in_game':game})
            res.render('pages/summonerPage',player);
          })
        } else{
          res.render('pages/summonerPage',player);
        }
      });
    }else{
      requestProfile(req.body.name, function(result){
        if (result != 'undefined'){
          var id = result.id
          var data = result
        }else{
          console.log('cannot find summoner: ' + req.body.name)
          res.render('pages/summonerPage');
          return;
        }
        requestRanked(id, function(ranked){
          if (ranked != 'undefined'){
            data = Object.assign(data, {'ranked':ranked})
            insertSummoner(data)
          }
          in_game(id, function(game){
            if (game != 'undefined' && game!= undefined) {
              gameType(game.gameQueueConfigId, function(queue){
                if(queue!=''){
                  game.gameQueueConfigId = queue
                }
                data = Object.assign(data, {'in_game':game})
                res.render('pages/summonerPage',data);
              })
            } else{
              res.render('pages/summonerPage',data);
            }
          });
        });
      })
    }
  });
  }

function insertSummoner(summo){
  const newSummoner = models.Summoner({
    _id : summo.id,
    accountId : summo.accountId,
    profileIconId : summo.profileIconId,
    revisionDate : summo.revisionDate,
    name : summo.name,
    lowerName : summo.name.toLowerCase(),
    summonerLevel: summo.summonerLevel,
    lastUpdate : new Date(),
    ranked : summo.ranked
  })

  newSummoner.save(function(err){
    if (err) throw err;
    console.log(summo.name + " inserted")
  })
}

function requestProfile(playerName, callback){
      url= encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+playerName);
      request({'url': url, 'headers': headers}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        
        var val= JSON.parse(body);
      }else{
        var val ='undefined';
      }
      callback(val);
    }); 
  }

function requestRanked(id, callback){
  url = encodeURI('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id);
  var val ='undefined';
  request({'url': url, 'headers': headers}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var val= JSON.parse(body);
  }
  callback(val);
});
}

function in_game(id,callback){
  url = encodeURI('https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/'+ id);
  var val ='undefined';
  request({'url': url, 'headers': headers}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var val= JSON.parse(body);
  }
  callback(val);
});
}

function gameType(idQueue, callback){
  url = 'http://static.developer.riotgames.com/docs/lol/queues.json';
  var res=''
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
      var val= JSON.parse(body);
      val.forEach(function (item, index) {
      
        if (item.queueId == idQueue){
            console.log(item.map)
            res =item.map + ", " + item.description
          }
      })
    }
    callback(res)
  })
}

function gameHistory(queueId,accountId, endIndex,callback){
  if (queueId !='-1'){
    url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?queue=' + queueId +'&endIndex='+ endIndex);
  }
  else{
    url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?endIndex='+ endIndex );
  }
  var val=''
    request({'url': url, 'headers': headers}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var val= JSON.parse(body);
      }else{
        console.log(body)  
      }
      callback(val)       
    })
  }

function gameInfo(matchid,callback){
  url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matches/' + matchid);
  var val=''
    request({'url': url, 'headers': headers}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var val= JSON.parse(body);
      }else{
        console.log(body)  
      }
      callback(val)
      return("val")
    })
  }

function ChampionIdToName(id, callback){
  request('https://ddragon.leagueoflegends.com/api/versions.json', function (error, response, lolvers){
    verslist = JSON.parse(lolvers) 
    vers = verslist[0]
    url = 'http://ddragon.leagueoflegends.com/cdn/'+ vers +'/data/en_US/champion.json'
    request(url , function (error, response, body){
      body = JSON.parse(body)
      champions = {}
      Object.keys(body.data).forEach(champion =>{
        key = body['data'][champion].key;
        champions[key] = champion;}
      )
     callback(champions[id])
    })
  })
  
}
function winrateChampOne(matchinfo,accountId, callback){
  var participantID;
  for( const player of matchinfo.participantIdentities){
    if (player.player.accountId == accountId){
      participantID = player.participantId - 1
    }
  };
  ChampionIdToName(matchinfo.participants[participantID].championId, function(champion){
    if (participantID <=5){
      participantID = 0
    } else {
      participantID = 1
    }
    if (matchinfo.teams[participantID].win =='Win'){
      console.log(true)
      console.log(champion)
      callback(true, champion)
    } else{
      console.log(false)
      console.log(champion)
      callback(false,champion)
      }
    })
}

function matchCalc(result, champion){
  if (result){
    win +=1
    if (champion_winrates.hasOwnProperty(champion)){
      champion_winrates[champion][0] += 1
    }else{
      champion_winrates[champion] = [1,0,0]
    }
  }else{
    loss+=1
    if (champion_winrates.hasOwnProperty(champion)){
      champion_winrates[champion][1] += 1
    }else{
      champion_winrates[champion] = [0,1,0]
    }
  }
  champion_winrates[champion][2] += 1
  return(4)
}

function winrateChamp(req, res){
  gameHistory(req.body.queueId, req.body.accountId, req.body.endIndex, async function(gameHisto){
    win = 0
    loss = 0
    champion_winrates = {}
      for( const match of gameHisto.matches){
        await gameInfo(match.gameId, async function(matchinfo){
          await winrateChampOne(matchinfo, req.body.accountId,async function(result,champion){
            await matchCalc(result, champion)
          })
          console.log(champion_winrates)
        })
      }
      // var items = Object.keys(champion_winrates).map(function(key) {
      //   return [key, champion_winrates[key]];
      // });
      
      // Sort the array based on the second element
      // items.sort(function(first, second) {
      //   return second[1] - first[1];
      // });
      res.json({'winrate':champion_winrates,'win':win,'loss':loss});
  });
}
function loadGame(req,res){}

function insertGame(game){
  const newGame = models.Game({
      _id	 : game.gameId,    
      gameType : game.gameType,
      gameDuration	 : game.gameDuration,
      platformId : game.platformId,
      gameCreation: game.gameCreation,
      seasonId : game.seasonId,
      gameVersion	: game.gameVersion,
      mapId : game.mapId,
      gameMode :  game.gameMode,
      teams : game.teams,
      participants : game.participants,
      participantIdentities: game.participantIdentities,
  })
  newGame.save(function(err){
    if (err) throw err;
    console.log(game.gameId + " game inserted")
      })
}

async function insertGameInPlayer(game){
  for(player of game.participantIdentities){
    await models.Summoner.findOne({lowerName: player.player.summonerName.toLowerCase()}, async function (err, summo){ 
      if(summo){
        models.Summoner.update(
          { _id: player.player.summonerId }, 
          { $push: { GamesIdList: [game.gameId] } }, function(err, ans){
            if (err) throw err;
          console.log(player.player.summonerName + " updated with game " + game.gameId)
        });
      }else{
        console.log(player.player.summonerName)
        const newSummoner = models.Summoner({
          _id : player.player.summonerId,
          accountId : player.player.accountId,
          profileIconId : player.player.profileIcon,
          name : player.player.summonerName,
          lowerName : player.player.summonerName.toLowerCase(),
          lastUpdate : new Date(),
          GamesIdList: [game.gameId]
        })
      
        await newSummoner.save(function(err){
          if (err) throw err;
          console.log(player.player.summonerName + " inserted with game " + game.gameId)
        })
      }
    })
  }
  console.log('done')
  return('done')
}

function historyInsert(req, res){
  gameHistory(req.body.queueId,req.body.accountId, req.body.endIndex,function(gameHisto){
    var bar = new Promise((resolve, reject) =>{ gameHisto.matches.forEach((match, index, array) => 
      models.Game.findOne({_id: match.gameId}, async function (err, oneGame){
        if (oneGame){
          if (index === array.length -1) resolve();
        }else{
          console.log("next game")
          await gameInfo(match.gameId,async function(result){
            console.log('game info loaded')
            //insertGame(result)
            await insertGameInPlayer(result)
            if (index === array.length -1) resolve();
          })
        }
      })
      );
    }); 
    bar.then(() => {res.json('done');});
  })
}


module.exports.generateHTML = generateHTML;
module.exports.historyInsert = historyInsert;
module.exports.winrateChamp = winrateChamp;
