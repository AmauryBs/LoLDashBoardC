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
  name = req.body.name.trim()
  player = await models.Summoner.findOne({lowerName: name.toLowerCase()})
  if(player){
    game = await in_game(player.id)
    if (game != 'error' && game!= undefined) {
      queue = await gameType(game.gameQueueConfigId)
      if(queue!=''){
        game.gameQueueConfigId = queue
      }
      player = Object.assign(player, {'in_game':game})
      res.render('pages/summonerPage',player);
    }else{
      res.render('pages/summonerPage',player);
    }
  }else{
    data = await dataSummoner(req.body.name, true)
    await insertSummoner(data)
    game = await in_game(data.id)
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

async function dataSummoner(id, byName){
  profile = await requestProfile(id, byName)
  if (profile != 'undefined'){
    var id = profile.id
    var data = profile
  }else{
    console.log('cannot find summoner: ' + id)
    return({});
  }
  ranked = await requestRanked(id)
  if (ranked != 'undefined'){
    data = Object.assign(data, {'ranked':ranked})
  }
  return(data)
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
    lastUpdate : 0,
    ranked : summo.ranked
  })
  try{
    await newSummoner.save()
    //console.log(summo.name + " inserted")
  }catch(e){
      console.error(e.error);
    }
}

async function requestProfile(id, byName){
  var url = ""
  if(byName){
    url= encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+id);
  }else{
    url= encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-account/'+id);
  }
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
    return JSON.parse(result)
  }
}

async function ServerStatus(req, res){
  url= encodeURI('https://euw1.api.riotgames.com/lol/status/v3/shard-data');
  var serviceStatus={}
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result) 
    console.log(result.services)
    for( const service of result.services){
      name = service.name
      status = service.status
      serviceStatus[name] =status
    };
  }catch(e){
    console.error(e);
    result = "error"
  } finally {
    res.json(serviceStatus)
  }
}

async function Challenger(req, res){
  if(req.body.queue == 'FLEX'){
    url= encodeURI('https://euw1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_FLEX_SR');
  }else{
    url= encodeURI('https://euw1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5');
  }
  try{
    var result = await requestP({'url': url, 'headers': headers})
    result = JSON.parse(result) 
    players = result.entries
    players.sort(function(first, second) {
      return second["leaguePoints"] - first["leaguePoints"];
    });
  }catch(e){
    console.error(e);
    players = "error"
  } finally {
    res.json(players)
  }
}

async function ChampionIdToName(req, res){
  id = req.body.id
  url= encodeURI('https://ddragon.leagueoflegends.com/api/versions.json');
  try{
  var result = await requestP({'url': url, 'headers': headers})
  verslist = JSON.parse(result)
  vers = verslist[0] 
  url2 = 'http://ddragon.leagueoflegends.com/cdn/'+ vers +'/data/en_US/champion.json'
  var champsIds = await requestP({'url': url2, 'headers': headers})
  champsIds = JSON.parse(champsIds)
  champions = {}
  Object.keys(champsIds.data).forEach(champion =>{
    key = champsIds['data'][champion].key;
    champions[key] = champion;})
    res.json(champions[id])
  }catch(e){
    console.error(e);
    res.json("error")
  } 
}

async function winrateChampOne(matchinfo,accountId){
  var participantID;
  for( const player of matchinfo.participantIdentities){
    if (player.player.accountId == accountId){
      participantID = player.participantId - 1
    }
  };
  champion = matchinfo.participants[participantID].championId
    if (participantID <=5){
      participantID = 0
    } else {
      participantID = 1
    }
    if (matchinfo.teams[participantID].win =='Win'){
      return [true, champion]
    } else{
      return [false,champion]
      }
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

async function winrateChamp(req, res){
  gameHisto = await loadGameBDD(req.body.name)
  win = 0
  loss = 0
  champion_winrates = {}
  for( const match of gameHisto){
    result = await winrateChampOne(match, req.body.accountId)
    await matchCalc(result[0], result[1])
  }
    var items = Object.keys(champion_winrates).map(function(key) {
      return [key, champion_winrates[key]];
    });
    
    //Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1][2] - first[1][2];
    });
    res.json({'winrate':items,'win':win,'loss':loss});
}



async function loadGameBDD(name){
  var games=[]
  try{
    player = await models.Summoner.findOne({lowerName: name.toLowerCase()})
    if(player){
      for(gameId of player.GamesIdList){
        games.push(await models.Game.findOne({_id: gameId}))
      }
    }
  }
  catch(e){
    console.error(e);
  }finally{
    return games
  }
}


async function getAverageStats(req,res){
  games = await loadGameBDD(req.body.name.trim())
  profile = await requestProfile(req.body.name.trim(),true)
  accountId = profile.accountId
  var topStats = {k:0,d:0,a:0,cs:0,dmg:0,game:0,vision:0, gold:0}
  var jnglStats = {k:0,d:0,a:0,cs:0,dmg:0,game:0,vision:0, gold:0}
  var midStats = {k:0,d:0,a:0,cs:0,dmg:0,game:0,vision:0, gold:0}
  var botStats = {k:0,d:0,a:0,cs:0,dmg:0,game:0,vision:0, gold:0}
  var suppStats = {k:0,d:0,a:0,cs:0,dmg:0,game:0,vision:0, gold:0}
  var participantID = -1 
  for(game of games){
    for( const player of game.participantIdentities){
      if (player.player.accountId == accountId){
        participantID = player.participantId - 1
      }
    };
    //console.log(game.participants[participantID])
    var lane = game.participants[participantID]["timeline"]["lane"]
    switch (lane) {

      case "TOP":
        topStats['k'] += game.participants[participantID]["stats"]["kills"]
        topStats['d'] += game.participants[participantID]["stats"]["deaths"]
        topStats['a'] += game.participants[participantID]["stats"]["assists"]
        topStats['cs'] += game.participants[participantID]["stats"]["totalMinionsKilled"]
        topStats['dmg'] += game.participants[participantID]["stats"]["totalDamageDealtToChampions"]
        topStats['vision'] += game.participants[participantID]["stats"]["visionScore"]
        topStats['gold'] += game.participants[participantID]["stats"]["goldEarned"]
        topStats['game'] += 1

      case "JUNGLE":
        jnglStats['k'] += game.participants[participantID]["stats"]["kills"]
        jnglStats['d'] += game.participants[participantID]["stats"]["deaths"]
        jnglStats['a'] += game.participants[participantID]["stats"]["assists"]
        jnglStats['cs'] += game.participants[participantID]["stats"]["totalMinionsKilled"]
        jnglStats['dmg'] += game.participants[participantID]["stats"]["totalDamageDealtToChampions"]
        jnglStats['vision'] += game.participants[participantID]["stats"]["visionScore"]
        jnglStats['gold'] += game.participants[participantID]["stats"]["goldEarned"]
        jnglStats['game'] += 1

      case "MIDDLE":
        midStats['k'] += game.participants[participantID]["stats"]["kills"]
        midStats['d'] += game.participants[participantID]["stats"]["deaths"]
        midStats['a'] += game.participants[participantID]["stats"]["assists"]
        midStats['cs'] += game.participants[participantID]["stats"]["totalMinionsKilled"]
        midStats['dmg'] += game.participants[participantID]["stats"]["totalDamageDealtToChampions"]
        midStats['vision'] += game.participants[participantID]["stats"]["visionScore"]
        midStats['gold'] += game.participants[participantID]["stats"]["goldEarned"]
        midStats['game'] += 1

      case "BOTTOM":
        if (game.participants[participantID]["timeline"]["role"] == "DUO_CARRY"){
          botStats['k'] += game.participants[participantID]["stats"]["kills"]
          botStats['d'] += game.participants[participantID]["stats"]["deaths"]
          botStats['a'] += game.participants[participantID]["stats"]["assists"]
          botStats['cs'] += game.participants[participantID]["stats"]["totalMinionsKilled"]
          botStats['dmg'] += game.participants[participantID]["stats"]["totalDamageDealtToChampions"]
          botStats['vision'] += game.participants[participantID]["stats"]["visionScore"]
          botStats['gold'] += game.participants[participantID]["stats"]["goldEarned"]
          botStats['game'] += 1
        }else{
          suppStats['k'] += game.participants[participantID]["stats"]["kills"]
          suppStats['d'] += game.participants[participantID]["stats"]["deaths"]
          suppStats['a'] += game.participants[participantID]["stats"]["assists"]
          suppStats['cs'] += game.participants[participantID]["stats"]["totalMinionsKilled"]
          suppStats['dmg'] += game.participants[participantID]["stats"]["totalDamageDealtToChampions"]
          suppStats['vision'] += game.participants[participantID]["stats"]["visionScore"]
          suppStats['gold'] += game.participants[participantID]["stats"]["goldEarned"]
          suppStats['game'] += 1
        }

    }
  }
  averageStats = {"TOP":topStats, "JUNGLE":jnglStats, "MIDDLE":midStats,  "DUO_CARRY":botStats, "DUO_SUPPORT":[]}
  res.json(averageStats)
}

async function loadGame(req,res){
  games = await loadGameBDD(req.body.name.trim())
  res.json(games)
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
    try{
      summo =await models.Summoner.findOne({lowerName: player.player.summonerName.toLowerCase()}) 
      if(summo){
        await models.Summoner.updateOne(
          { _id: player.player.summonerId }, 
          { $push: { GamesIdList: [game.gameId] }});
      }else{
        const newSummoner = models.Summoner({
          _id : player.player.summonerId,
          accountId : player.player.accountId,
          profileIconId : player.player.profileIcon,
          name : player.player.summonerName,
          lowerName : player.player.summonerName.toLowerCase(),
          lastUpdate : 0,
          GamesIdList: [game.gameId]
        })
        await newSummoner.save()
      }
    }catch(e){
        console.error(e.error);
    }
  }
  return('done')
}
async function updatePlayer(summo){
  try{
    await models.Summoner.updateOne(
    { accountId: summo.accountId }, 
    { $set: { 
      profileIconId : summo.profileIconId,
      revisionDate : summo.revisionDate,
      name : summo.name,
      lowerName : summo.name.toLowerCase(),
      summonerLevel: summo.summonerLevel,
      lastUpdate : new Date(),
      ranked : summo.ranked }});
  }catch(e){
    console.error(e)
  }
}

async function updateAll(req, res){
  try{
    summo = await models.Summoner.findOne({accountId: req.body.accountId})
    delta = new Date() - summo.lastUpdate
    if(delta <= 120000 ){
      var minutes = Math.floor(delta / 60000);
      var seconds = ((delta % 60000) / 1000).toFixed(0);
      res.json('last update '+ minutes + ' min' + seconds + ' s ago you can only update every 2 minutes')
    }else{
      data = await dataSummoner(summo.accountId, false)
      await updatePlayer(data)
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
  }catch(e){
    console.error(e)
    res.json('error finding summoner');
  }
}

module.exports.generateHTML = generateHTML;
module.exports.updateAll = updateAll;
module.exports.winrateChamp = winrateChamp;
module.exports.loadGame = loadGame;
module.exports.ChampionIdToName = ChampionIdToName;
module.exports.ServerStatus = ServerStatus;
module.exports.Challenger = Challenger;
module.exports.getAverageStats = getAverageStats;