var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SummonerSchema = new Schema({
  _id : String,
  accountId : String,
  profileIconId : mongoose.Number,
  revisionDate : mongoose.Number,
  name : String,
  lowerName:{ type: String, lowercase: true},
  summonerLevel: mongoose.Number,
  GamesIdList : [mongoose.Number],
  lastUpdate : mongoose.Number
},{ _id: false });


const GameSchema = new Schema({
    _id	 : mongoose.Number,
    participantId : mongoose.Number,
    SummonerId : String,
    gameType : String,
    gameDuration	 : mongoose.Number,
    teams : String,
    platformId : String,
    gameCreation: mongoose.Number,
    seasonId : mongoose.Number,
    gameVersion	: String,
    mapId : mongoose.Number,
    gameMode : String,
    participantIdentities : [{
        championId: mongoose.Number,
        teamId: mongoose.Number,
        spell1Id: mongoose.Number,
        spell2Id: mongoose.Number,
        timeline:{
            csDiffPerMinDeltas : [{
                time: String,
                value: mongoose.Number}],
            damageTakenPerMinDeltas : [{
                time: String,
                value: mongoose.Number}],
            role : String,
            damageTakenDiffPerMinDeltas : [{
                time: String,
                value: mongoose.Number}],
            xpPerMinDeltas : [{
                time: String,
                value: mongoose.Number}],
            xpDiffPerMinDeltas:[{
                time: String,
                value: mongoose.Number}],
            lane: String,
            creepsPerMinDeltas:[{
                time: String,
                value: mongoose.Number}],
            goldPerMinDeltas:[{
                time: String,
                value: mongoose.Number}],
        },
        stats:{
           items:{
               item0: mongoose.Number,
               item1: mongoose.Number,
               item2: mongoose.Number,
               item3: mongoose.Number,
               item4: mongoose.Number,
               item5: mongoose.Number,
               item6: mongoose.Number
           },
           damageDealt:{  
               trueDamageDealt: mongoose.Number,
               damageDealtToTurrets: mongoose.Number,
               damageDealtToObjectives: mongoose.Number,
               physicalDamageDealt: mongoose.Number,
               magicDamageDealt: mongoose.Number,
               totalDamageDealt: mongoose.Number,
               physicalDamageDealtToChampions: mongoose.Number,
               magicDamageDealtToChampions: mongoose.Number,
               trueDamageDealtToChampions: mongoose.Number, 
               totalDamageDealtToChampions: mongoose.Number,
               largestCriticalStrike: mongoose.Number
           },
           damageTakenHealed:{
               totalUnitsHealed: mongoose.Number,
               physicalDamageTaken: mongoose.Number,
               magicalDamageTaken: mongoose.Number,
               trueDamageTaken: mongoose.Number,
               totalDamageTaken: mongoose.Number,
               damageSelfMitigated: mongoose.Number
           },
           vision:{
               wardsPlaced: mongoose.Number,
               wardsKilled: mongoose.Number,
               visionWardsBoughtInGame: mongoose.Number,
               visionScore: mongoose.Number
           },
           income:{
               goldEarned: mongoose.Number,
               goldSpent: mongoose.Number,
               totalMinionsKilled: mongoose.Number,
               neutralMinionsKilled: mongoose.Number,
               neutralMinionsKilledTeamJungle: mongoose.Number,
               neutralMinionsKilledEnemyJungle: mongoose.Number
           }, 
           combat:{
               kills: mongoose.Number,
               deaths: mongoose.Number,
               assists: mongoose.Number,
               doubleKills: mongoose.Number,
               tripleKills: mongoose.Number,
               quadraKills: mongoose.Number,
               pentaKills: mongoose.Number,
               largestMultiKill: mongoose.Number,
               killingSprees: mongoose.Number,
               timeCCingOthers: mongoose.Number,
               totalTimeCrowdControlDealt: mongoose.Number,
               firstBloodAssist: Boolean,
               firstBloodKill: Boolean
           },
           misc:{
               firstInhibitorKill: Boolean,
               firstInhibitorAssist: Boolean,
               champLevel: mongoose.Number,
               win: Boolean,
           },
           perks:{
               perk0: mongoose.Number,
               perk0Var1: mongoose.Number,
               perk0Var2: mongoose.Number,
               perk0Var3: mongoose.Number,
               perk1: mongoose.Number,
               perk1Var1: mongoose.Number,
               perk1Var2: mongoose.Number,
               perk1Var3: mongoose.Number,
               perk2: mongoose.Number,
               perk2Var1: mongoose.Number,
               perk2Var2: mongoose.Number,
               perk2Var3: mongoose.Number,
               perk3: mongoose.Number,
               perk3Var1: mongoose.Number,
               perk3Var2: mongoose.Number,
               perk3Var3: mongoose.Number,
               perk4: mongoose.Number,
               perk4Var1: mongoose.Number,
               perk4Var2: mongoose.Number,
               perk4Var3: mongoose.Number,
               perk5: mongoose.Number,
               perk5Var1: mongoose.Number,
               perk5Var2: mongoose.Number,
               perk5Var3: mongoose.Number,
               perkPrimaryStyle: mongoose.Number,
               perkSubStyle: mongoose.Number,
               statPerk0: mongoose.Number,
               statPerk1: mongoose.Number, 
               statPerk2: mongoose.Number
           }

        }

    }],
    teams:[{
        teamId: mongoose.Number,
        win: String,
        stats:{
            towerKills: mongoose.Number,
            riftHeraldKills: mongoose.Number,
            firstBlood: Boolean,
            inhibitorKills: mongoose.Number,
            firstBaron: Boolean,
            firstDragon: Boolean,
            dragonKills: mongoose.Number,
            baronKills: mongoose.Number,
            firstInhibitor: Boolean,
            firstTower: Boolean,
            firstRiftHerald: Boolean
        }
    }]
  }, { _id: false });
  

var Summoner = mongoose.model('Summoner', SummonerSchema)
var Game = mongoose.model('Game', GameSchema)

module.exports = {
    Summoner : Summoner,
    Game : Game
}
