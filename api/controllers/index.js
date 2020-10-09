require('dotenv').config()
request = require('request')



function generateHTML(req, res) {
    if (req.body.name == '') {
        console.log('empty name')
        res.render('pages/summonerPage');
        return;
    }
    requestProfile(req.body.name, function (result) {
        if (result != 'undefined' && result != undefined) {
            var id = result.id
            var data = result
        } else {

            console.log('cannot find summoner: ' + req.body.name)
            res.render('pages/summonerPage');
            return;
        }

        requestRanked(id, function (ranked) {
            if (ranked != 'undefined' &&ranked != undefined) {
                data = Object.assign({ 'account': data }, { 'ranked': ranked })
            }
            in_game(id, function (game) {
                if (game != 'undefined' && game != undefined) {
                    gameType(game.gameQueueConfigId, function (queue) {
                        if (queue != '') {
                            game.gameQueueConfigId = queue
                        }
                        data = Object.assign(data, { 'in_game': game })
                        res.render('pages/summonerPage', data);
                    })
                } else {
                    res.render('pages/summonerPage', data);
                }
            });
        });
    });
}


function requestProfile(name, callback) {
    url = encodeURI('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + '?api_key=' + process.env.API_KEY);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var val = JSON.parse(body);
        } else {
            var val = 'undefined';
        }
        callback(val);
    });
}

function requestRanked(id, callback) {
    url = encodeURI('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + id + '?api_key=' + process.env.API_KEY);
    var val = 'undefined';
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var val = JSON.parse(body);
        }
        callback(val);
    });
}

function in_game(id, callback) {
    url = encodeURI('https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/' + id + '?api_key=' + process.env.API_KEY);
    var val = 'undefined';
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var val = JSON.parse(body);
        }
        callback(val);
    });
}

function gameType(idQueue, callback) {
    url = 'http://static.developer.riotgames.com/docs/lol/queues.json';
    var res = ''
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var val = JSON.parse(body);
            val.forEach(function (item, index) {

                if (item.queueId == idQueue) {
                    console.log(item.map)
                    res = item.map + ", " + item.description
                }
            })
        }
        callback(res)
    })
}

function gameHistory(queueId, accountId, endIndex, callback) {

    if (queueId != -1) {
        url = encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?queue=' + queueId + '&endIndex=' + endIndex + '&api_key=' + process.env.API_KEY);
    }
    else {
        url = encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?endIndex=' + endIndex + '&api_key=' + process.env.API_KEY);
    }
    var val = ''
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var val = JSON.parse(body);
        } else {
            console.log(body)
        }
        callback(val)
    })
}

function gameInfo(matchid, callback) {
    url = encodeURI('https://euw1.api.riotgames.com/lol/match/v4/matches/' + matchid + '?api_key=' + process.env.API_KEY);
    var val = ''
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var val = JSON.parse(body);
        } else {
            console.log(body)
        }
        callback(val)
    })
}

function historyInfo(req, res) {
    gameHistory(req.body.queueId, req.body.accountId, req.body.endIndex, function (gameHisto) {
        history = []
        var bar = new Promise((resolve, reject) => {
            gameHisto.matches.forEach((element, index, array) =>
                gameInfo(element.gameId, function (result) {
                    history.push(result)
                    if (index === array.length - 1) resolve();
                })
            );
        });
        bar.then(() => { res.json(history); });
    })
}


module.exports.generateHTML = generateHTML;
module.exports.historyInfo = historyInfo;