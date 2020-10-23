const router = require('express').Router();
const controller = require('../controllers');

router.post('/summonerPage', (req, res) => {
    controller.generateHTML(req, res);
});

router.post('/gameHistory', (req, res) => {
    controller.historyInfo(req, res);
});

/*router.get('/getChampionName', (req, res) => {
    controller.ChampionIdToName(req.id, res);
    console.log(req);
});*/

router.get('/winrateChamp', (req, res) => {
    controller.winrateChamp(req, res);
});


module.exports = router;


