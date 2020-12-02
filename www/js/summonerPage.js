$(document).ready(function () {

    window.nbUpdate = 1;
    /*
    Adapt position of buttons with the window width
    */ 
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

    //update when click on update Button
    $("#updateButton").on("click", function () {
        let accId = $(this).val();
        //console.log("Loading 10 games");
        updateGame(accId, 10);
    });




});

function loadGame(name) {

    /** 
     * get 10 games from the loadgame route
     * then exec displayGameHistory(games, name);
     * params : name of player
     * */ 
    $.ajax({
        url: "/loadGame",
        type: "POST",
        cache: false,
        data: { 'name': name, 'queueId': -1, 'endIndex': 10 },
        dataType: 'JSON'
    }).done(function (games, name) {
        //console.log(games);
        displayGameHistory(games, name);
        $("#updateButton").attr('disabled', false);
        $("#updateButton").text('Update');

    });
}

function updateGame(accID, endIndex) {
    /** 
     * update game with calling update route
     * then exec loadGame(name);
     * params : 
     * accID : account ID of player
     * endIndex : nb of games
     * */ 
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

function ChampionIdToName(championID, CSSid, nameImg="") {
    /** 
     * get champion name with an ID
     * then exec displayChampName(champName, CSSid);
            or/and displayChampImg(champName, CSSid);
     * params : 
     * championID : champion ID
     * CSSid : id of a HTML DOM element
     * nameImg : by default "", take "img" or "name"
     * */ 
    $.ajax({
        url: "/ChampionIdToName",
        type: "POST",
        cache: false,
        data: { 'id': championID },
        dataType: 'JSON'
    }).done(function (champName) {
        if (nameImg == 'name')
            displayChampName(champName, CSSid);
        else if (nameImg == 'img')
            displayChampImg(champName, CSSid);

        else {
            displayChampName(champName, CSSid);
            displayChampImg(champName, CSSid);
        }

    }).catch(function(e) {
        if(e.statusText == 'timeout')
        {     
          alert('Native Promise: Failed from timeout'); 
          //do something. Try again perhaps?
        }
    });
}

function displayChampName(champName, CSSid) {
    /** 
     * add champName to the html of element of class .champName in element of id CSSid 
     * params : 
     * champName : champion name
     * CSSid : id of a HTML DOM element
     * */ 
    $('#' + CSSid + ' .champName').html(champName);
}

function displayChampImg(champName, CSSid) {
    /** 
     * add src in an img element of class .champName in element of id CSSid 
     * params : 
     * champName : champion name
     * CSSid : id of a HTML DOM element
     * */ 
    $('#' + CSSid + ' .champImg').attr("src", "http://ddragon.leagueoflegends.com/cdn/10.24.1/img/champion/" + champName + ".png");
}

function redirectOnOtherSummoner(name) {
    /** 
     * call route summonerPage to display a summoner of name 'name'
     * Ex used when clicking on a player links in the game history
     * params :  
     * name : name of the summoner
     * */ 
    $.ajax({
        url: "/summonerPage",
        type: "POST",
        cache: false,
        data: { 'name': name },
        dataType: 'JSON'
    });
}

function displayGameHistory(games, name) {
    /** 
     * Big function to display all data from games
     * params : 
     * games : LIST if games
     * name : name of the summoner
     * */ 

    if (games.length < 10 && window.nbUpdate == 1) {
        //if the number of games of the player is not enough => update auto
        window.nbUpdate = 0;// setting at 0 to not update if page reloading
        //console.log(10 - games.length);

        //change update Button caracteristic to disable click capabilitie
        $("#updateButton").attr('disabled', true);
        $("#updateButton").text('Loading');
        updateGame($('#updateButton').val(), 10 - games.length);// call updateGame
    }
    games.forEach(game => {
        // loop for each games


        //get Win or Fail for the team where player is
        var partId = 1;
        //get Id of the summoner in the game
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

        //game time
        let gameDurationTime = secondsToHms(game.gameDuration);

        //define KDA
        let kills = game.participants[partId - 1].stats.kills;
        let deaths = game.participants[partId - 1].stats.deaths;
        let assists = game.participants[partId - 1].stats.assists;

        //display KDA
        var KDA = $("<div/>", { class: "KDAStats", html: "<span>" + kills + "</span> / <span>" + deaths + "</span> / <span>" + assists + "</span>" });
        var KDAratio = $("<span/>", { class: "KDARation", html: Math.round(((kills + assists) / deaths) * 100) / 100 + ":1 KDA" });

        //did he get multiple kill ?
        var killAchievement = $("<div/>", { class: "killAchievements" });
        var firstUl = $("<ul/>");
        var liMultiKills = $("<li/>",{html : "kill Achievements"})
        var secondUl = $("<ul/>");

        secondUl.append($('<li/>',{html : "Penta Kills : " + game.participants[partId - 1].stats.pentaKills}));
        secondUl.append($('<li/>',{html : "Quadra Kills : " + game.participants[partId - 1].stats.quadraKills}));
        secondUl.append($('<li/>',{html : "Triple Kills : " + game.participants[partId - 1].stats.tripleKills}));
        secondUl.append($('<li/>',{html : "Double Kills : " + game.participants[partId - 1].stats.doubleKills}));
        liMultiKills.append(secondUl);
        firstUl.append(liMultiKills);
        killAchievement.append(firstUl);

        //get level 
        var level = $("<div/>", { class: "champLevel", html: " Niveau " + game.participants[partId - 1].stats.champLevel });

        //CS on minions
        let CSByMin = game.participants[partId - 1].stats.totalMinionsKilled/(game.gameDuration/60)
        let CSContent = $('<span/>', { class: "CS tip", html: game.participants[partId - 1].stats.totalMinionsKilled + " CS ("+Math.round(CSByMin * 100) / 100+" CS/Min)" });
        var CS = $('<div/>', { class: "CS", html: CSContent });

        //Teams
        let team100 = $("<div/>", { class: "team100" });
        let team200 = $("<div/>", { class: "team200" });

        //for each player, create a form
        for (let i = 0; i < game.participantIdentities.length; i++) {

            let playerName = game.participantIdentities[i].player.summonerName;
            var hiddenInput = $('<input/>', { type: "hidden", name: "name", value: playerName });
            var a = $('<a/>', { href: "#", onclick: "document.getElementById('form" + playerName + "').submit()", html: playerName })
            var form = $('<form/>', { id: "form" + playerName, method: "post", action: "/summonerPage" })

            form.append($('<img/>', { class: "champImg champOthers" }));
            form.append(hiddenInput);
            form.append(a);

            if (game.participants[i].teamId == 100) {
                team100.append($('<p/>', { class: "participant", html: form }));
            }
            else {
                team200.append($('<p/>', { class: "participant", html: form }));
            }
            
            let champName = "champName";
            let championId = game.participants[i].championId;
            
            //console.log(championId);
            champName = ChampionIdToName(championId, "form" + playerName,'img');
        }

        // first colonne with an article to display general stats of the game
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

        //get and display champion name
        let champName = "champName";
        let championId = game.participants[partId - 1].championId;
        champName = ChampionIdToName(championId, "gameSettingInfos" + game._id); 

        //display column summoner Stats (KDA, multiKill, sbires...)
        let summonerStats = $("<article/>", { class: "summonerStats" });
        summonerStats.append($('<div/>', { class: "KDA", title: "KDA", html: [KDA, KDAratio, killAchievement] }));
        let othersummonerStats = level.append(CS);
        summonerStats.append($('<div/>', { class: "CS", html: othersummonerStats }));


        let teams = $("<article/>", { class: "teams" });
        //column for team 100
        teams.append(team100);

        //column for team 200
        teams.append(team200);

        //get all columns to display it
        let content = [gameStats, gameSettingInfos, summonerStats, teams];
        let gameContent = $("<div/>", { id: "gameContent" + game._id, class: "gameContent", html: content });
        gameContent.addClass(result); // set  Class Win or Fail
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


