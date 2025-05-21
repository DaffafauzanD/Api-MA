//#region imports
const cors = require("cors");
const bodyParser = require("body-parser");
const { connect } = require("./Db.js");
const express = require('express')
const Produksitelur = require("./routes/ProduksiTelurController");
//#endregion imports

//#region conncection
const app = express()
const port = 3000
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

connect()
  .then((connection) => {
    console.log("Connected to the database.");
  })
  .catch((error) => {
    console.log("Database connection failed!");
    console.log(error);
  });
//#endregion conncection

//#region routes
app.get('/', (req, res) => {
  res.send('API is running')
})

app.use('/Api', Produksitelur);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//#endregion routes