const { Template } = require('ejs');
const { version } = require('mongoose');
const models = require('../../schemas');

require('dotenv').config()

const requestP = require("request-promise");



headers = {
  "Origin": "https://developer.riotgames.com",
  "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Riot-Token": process.env.API_KEY,
}

async function generateHTML(req, res) {
  if(req.body.name ==''){
    console.log('empty name')
    res.render('pages/summonerPage');
    return;
  }
  player = await models.Summoner.findOne({lowerName: req.body.name.toLowerCase()})
  if(player){
    game = await in_game(player.id)
    if (game != 'error' && game!= undefined) {
      queue = await gameType(game.gameQueueConfigId)
      console.log(queue)
      if(queue!=''){
        game.gameQueueConfigId = queue
      }
      player = Object.assign(player, {'in_game':game})
      res.render('pages/summonerPage',player);
    }else{
      res.render('pages/summonerPage',player);
    }
  }else{
    result = await requestProfile(req.body.name)
    if (result != 'undefined'){
      var id = result.id
      var data = result
    }else{
      console.log('cannot find summoner: ' + req.body.name)
      res.render('pages/summonerPage');
      return;
    }
    ranked = await requestRanked(id)
    if (ranked != 'undefined'){
      data = Object.assign(data, {'ranked':ranked})
      insertSummoner(data)
    }
    game = await in_game(id)
    if (game != 'undefined' && game!= undefined) {
      queue = await gameType(game.gameQueueConfigId)
      if(queue!=''){
        game.gameQueueConfigId = queue
      }
      data = Object.assign(data, {'in_game':game})
      res.render('pages/summonerPage',data);
    }else{
      res.render('pages/summonerPage',data);
    }
  }
}

async function insertSummoner(summo){
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
  try{
    await newSummoner.save()
    //console.log(summo.name + " inserted")
  }catch(e){
      console.error(e.error);
    }
}

async function requestProfile(playerName){
  url= encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+playerName);
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result)
  }catch(e){
    console.error(e.error);
    result = "error"
  }finally {
    return(result);
  }
}

async function requestRanked(id){
  url = encodeURI('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id);
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result)
  }catch(e){
    console.error(e.error);
    result = "error"
  }finally {
    return(result);
  }
}

async function in_game(id){
  url = encodeURI('https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/'+ id);
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result)
  }catch(e){
    console.error(e.error);
    result = "error"
  }finally {
    return(result);
  }
}


async function gameType(idQueue){
  url = 'http://static.developer.riotgames.com/docs/lol/queues.json';
  var res=''
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result)
    result.forEach(function (item, index) {
      
      if (item.queueId == idQueue){
          console.log(item.map)
          res =item.map + ", " + item.description
        }
    })
  }catch(e){
    console.error(e.error);
    res = "error"
  }finally {
    return(res);
  }
}

async function gameHistory(queueId,accountId, endIndex){
  if (queueId !='-1'){
    url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?queue=' + queueId +'&endIndex='+ endIndex);
  }
  else{
    url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?endIndex='+ endIndex );
  }
  try{
    var result = await requestP({'url': url, 'headers': headers})
  }catch(e){
    console.error(e.error);
    result = "error"
      }finally {
        return new Promise(resolve => {resolve(JSON.parse(result))})
    }
  }

async function gameInfo(matchid){
  url= encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matches/' + matchid);
  var val=''
  try{
  var result = await requestP({'url': url, 'headers': headers})
  }catch(e){
    console.error(e.error);
    result = "error"
  } finally {
    return new Promise(resolve => {resolve(JSON.parse(result))})
  }
}

async function ChampionIdToName(id, callback){
  url= encodeURI('https://ddragon.leagueoflegends.com/api/versions.json');
  try{
  var result = await requestP({'url': url, 'headers': headers})
  verslist = JSON.parse(result)
  vers = verslist[0] 
  url2 = 'http://ddragon.leagueoflegends.com/cdn/'+ vers +'/data/en_US/champion.json'
  var champsIds = await requestP({'url': url2, 'headers': headers})
  champsIds = JSON.parse(champsIds)
  champions = {}
  Object.keys(body.data).forEach(champion =>{
    key = body['data'][champion].key;
    champions[key] = champion;})
    console.log(champions[id])
    callback(champions[id])
  }catch(e){
    console.error(e.error);
    callback("error")
  } 
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
async function loadGame(req,res){
  var games=[]
  try{
    player = await models.Summoner.findOne({lowerName: req.body.name.toLowerCase()})
    for(gameId of player.GamesIdList){
      games.push(await models.Game.findOne({_id: gameId}))
    }
  }
  catch(e){
    console.error(e.error);
  }finally{
    res.json(games)
  }
}

async function insertGame(game){
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
  try{
    await newGame.save()
    //console.log(game.gameId + " game inserted")
  }catch(e){
      console.error(e.error);
    }
}

async function insertGameInPlayer(game){
  for(player of game.participantIdentities){
    await models.Summoner.findOne({lowerName: player.player.summonerName.toLowerCase()}, async function (err, summo){ 
      if(summo){
        try{
          await models.Summoner.update(
            { _id: player.player.summonerId }, 
            { $push: { GamesIdList: [game.gameId] }});
        }catch(e){
            console.error(e.error);
          }
      }else{
        const newSummoner = models.Summoner({
          _id : player.player.summonerId,
          accountId : player.player.accountId,
          profileIconId : player.player.profileIcon,
          name : player.player.summonerName,
          lowerName : player.player.summonerName.toLowerCase(),
          lastUpdate : new Date(),
          GamesIdList: [game.gameId]
        })
        try{
          await newSummoner.save()
          //console.log(player.player.summonerName + " inserted with game " + game.gameId)
        }catch(e){
          console.error(e.error);
        }
      }
    })
  }
  return('done')
}

async function historyInsert(req, res){
  gameHisto = await gameHistory(req.body.queueId,req.body.accountId, req.body.endIndex)
  for( match of gameHisto.matches){
    oneGame = await models.Game.findOne({_id: match.gameId})
    if (oneGame){
    }else{
      const res = await gameInfo(match.gameId)
      insertGame(res)
      await insertGameInPlayer(res)
    }
  }
  res.json('done');
}

module.exports.generateHTML = generateHTML;
module.exports.historyInsert = historyInsert;
module.exports.winrateChamp = winrateChamp;
module.exports.loadGame = loadGame;