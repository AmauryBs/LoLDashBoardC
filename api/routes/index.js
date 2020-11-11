const router = require('express').Router();
const controller = require('../controllers');

router.post('/summonerPage', (req, res) => {
    controller.generateHTML(req, res);
});

router.post('/update', (req, res) => {
    controller.updateAll(req, res);
});

router.post('/loadGame', (req, res) => {
    controller.loadGame(req, res);

});

router.get('/winrateChamp', (req, res) => {
    controller.winrateChamp(req, res);

});

router.post('/gameHistory', (req, res) => {
    controller.historyInfo(req, res);
});

router.post('/ChampionIdToName', (req, res) => {
    controller.ChampionIdToName(req, res);
});


module.exports = router;



