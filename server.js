require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/posts', (req, res) => {
    res.json({"success": true});
  });

  
const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('app listening on port 3000!')
})