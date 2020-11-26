$(document).ready(function () {
    window.nbUpdate = 1;
    if ($(window).width() > 1200) {
        var margin = $('#colleftleft').width() + $('#colleftmiddle').width() - $('#colright').width();
        $('.centerButtons').css('left', $('#colcenter').width() / 2 - margin);
    }

    $(window).resize(function () {
        if ($(window).width() > 1200) {
            var margin = $('#colleftleft').width() + $('#colleftmiddle').width() - $('#colright').width();
            $('.centerButtons').css('left', $('#colcenter').width() / 2 - margin);
        }

    });

    $("#updateButton").on("click", function () {
        let accId = $(this).val();
        console.log("Loading 10 games");
        updateGame(accId, 10);
    });




});

function loadGame(name) {

    $.ajax({
        url: "/loadGame",
        type: "POST",
        cache: false,
        data: { 'name': name, 'queueId': -1, 'endIndex': 10 },
        dataType: 'JSON'
    }).done(function (games, name) {
        console.log(games);
        displayGameHistory(games, name);
        $("#updateButton").attr('disabled', false);
        $("#updateButton").text('Update');

    });
}

function updateGame(accID, endIndex) {
    console.log("update");
    $("#updateButton").attr('disabled', true);
    $("#updateButton").text('Loading');

    $.ajax({
        url: "/update",
        type: "POST",
        cache: false,
        data: { 'accountId': accID, 'queueId': -1, 'endIndex': endIndex },
        dataType: 'JSON'
    }).done(function () {
        console.log("done");

        loadGame($("#summonerName").html());

    });
}

function ChampionIdToName(championID, CSSclass, nameImg="") {

    $.ajax({
        url: "/ChampionIdToName",
        type: "POST",
        cache: false,
        data: { 'id': championID },
        dataType: 'JSON'
    }).done(function (champName) {
        if (nameImg == 'name')
            displayChampName(champName, CSSclass);
        else if (nameImg == 'img')
            displayChampImg(champName, CSSclass);

        else {
            displayChampName(champName, CSSclass);
            displayChampImg(champName, CSSclass);
        }

    });
}

function displayChampName(champName, CSSclass) {
    $('#' + CSSclass + ' .champName').html(champName);
    $('#' + CSSclass + ' .champImg').attr("src", "http://ddragon.leagueoflegends.com/cdn/10.24.1/img/champion/" + champName + ".png");
}

function displayChampImg(champName, CSSclass) {
    $('#' + CSSclass + ' .champImg').attr("src", "http://ddragon.leagueoflegends.com/cdn/10.24.1/img/champion/" + champName + ".png");
}

function displayGameHistory(games, name) {
    if (games.length < 10 && window.nbUpdate == 1) {
        window.nbUpdate = 0;
        console.log(10 - games.length);
        $("#updateButton").attr('disabled', true);
        $("#updateButton").text('Loading');
        updateGame($('#updateButton').val(), 10 - games.length);
    }
    games.forEach(game => {



        //récupérer Win ou Fail pour la game
        var partId = 1;
        game.participantIdentities.forEach(participantIdentity => {
            if (participantIdentity.player.summonerName == name) {
                partId = participantIdentity.participantId;
                //console.log(partId+" partId1");
            }
        });

        let sumTeamId = 100;
        sumTeamId = game.participants[partId - 1].teamId;

        let result = "Win";
        if (game.teams[0].teamId == sumTeamId) {
            result = game.teams[0].win;
        }
        else {
            result = game.teams[1].win;
        }

        //temps de jeu
        let gameDurationTime = secondsToHms(game.gameDuration);

        //get spells and their pictures

        //get runes and their pictures

        //KDA
        let kills = game.participants[partId - 1].stats.kills;
        let deaths = game.participants[partId - 1].stats.deaths;
        let assists = game.participants[partId - 1].stats.assists;

        var KDA = $("<div/>", { class: "KDAStats", html: "<span>" + kills + "</span> / <span>" + deaths + "</span> / <span>" + assists + "</span>" });
        var KDAratio = $("<span/>", { class: "KDARation", html: Math.round(((kills + assists) / deaths) * 100) / 100 + ":1" });
        //did he get multiple kill
        var multiKills = "";
        if (game.participants[partId - 1].stats.pentaKills > 0) {
            multiKills = "Penta Kills";
        }
        else if (game.participants[partId - 1].stats.tripleKills > 0) {
            multiKills = "Triple Kills";
        }
        else if (game.participants[partId - 1].stats.quadraKills > 0) {
            multiKills = " Quadra Kills";
        }
        else if (game.participants[partId - 1].stats.doubleKills > 0) {
            multiKills = "Double Kills";
        }

        var killAchievement = $("<div/>", { class: "killAchievement", html: multiKills });

        //level 
        var level = $("<div/>", { class: "champLevel", html: " Niveau " + game.participants[partId - 1].stats.champLevel });

        //CS on minions
        let CSContent = $('<span/>', { class: "CS tip", html: game.participants[partId - 1].stats.totalMinionsKilled + " sbires tués" });
        var CS = $('<div/>', { class: "CS", html: CSContent });

        //Teams
        let team100 = $("<div/>", { class: "team100" });
        let team200 = $("<div/>", { class: "team200" });

        for (let i = 0; i < game.participantIdentities.length; i++) {

            let playerName = game.participantIdentities[i].player.summonerName;
            var hiddenInput = $('<input/>', { type: "hidden", name: "name", value: playerName });
            var a = $('<a/>', { href: "#", onclick: "document.getElementById('form" + playerName + "').submit()", html: playerName })
            //var a = $('<button/>',{type:"submit", html:playerName})
            var form = $('<form/>', { id: "form" + playerName, method: "post", action: "/summonerPage" })

            form.append(hiddenInput);
            form.append(a);
            if (game.participants[i].teamId == 100) {

                team100.append($('<p/>', { class: "participant", html: form }));
            }
            else {
                team200.append($('<p/>', { class: "participant", html: form }));
            }
        }

        //première colonne avec un article avec les stats générales de la game
        let gameStats = $("<article/>", { class: "gameStats" });

        //Display GameType
        gameStats.append($('<div/>', { class: "gameType", title: game.gameMode, html: game.gameMode }));
        //Display Game Win or Fail
        gameStats.append($('<div/>', { class: "gameResult", html: result }));
        //Display GameType
        gameStats.append($('<span/>', { class: "gameDurationTime", html: "Time " + gameDurationTime }));

        //Display gameSettingInfos
        let gameSettingInfos = $("<article/>", { id: "gameSettingInfos" + game._id, class: "gameSettingInfos" });
        let championDiv = $('<div/>', { class: "champion" })
        //Display champName
        championDiv.append($('<div/>', { class: "champName" }));
        //Display champName
        let imgdiv = $('<div/>');
        imgdiv.append($('<img/>', { class: "champImg" }));
        championDiv.append(imgdiv);
        gameSettingInfos.append(championDiv);

        //get champion name

        let champName = "champName";
        let championId = game.participants[partId - 1].championId;
        champName = ChampionIdToName(championId, "gameSettingInfos" + game._id); //ON VERRA PLUS TARD


        //e colonne summoner Stats (KDA, multiKill, sbires...)
        let summonerStats = $("<article/>", { class: "summonerStats" });
        summonerStats.append($('<div/>', { class: "KDA", title: "KDA", html: [KDA, KDAratio, killAchievement] }));
        let othersummonerStats = level.append(CS);
        summonerStats.append($('<div/>', { class: "CS", html: othersummonerStats }));


        let teams = $("<article/>", { class: "teams" });
        //avant dernière colonne team 100
        teams.append(team100);

        //dernière colonne team 200
        teams.append(team200);

        let content = [gameStats, gameSettingInfos, summonerStats, teams];
        let gameContent = $("<div/>", { id: "gameContent" + game._id, class: "gameContent", html: content });
        gameContent.addClass(result); // set la Class Win ou Fail
        $("#gameHistory").append(gameContent)

    });

}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + ":" : "";
    var mDisplay = m > 0 ? m + ":" : "";
    var sDisplay = "00";
    if (s > 0) {
        sDisplay = s;
        if (s < 10) {
            sDisplay = "0" + s.toString();
        }
    }
    return hDisplay.toString() + mDisplay.toString() + sDisplay.toString();
}

function redirectOnOtherSummoner(name) {
    $.ajax({
        url: "/summonerPage",
        type: "POST",
        cache: false,
        data: { 'name': name },
        dataType: 'JSON'
    });
}
