//#region imports
const cors = require("cors");
const bodyParser = require("body-parser");
const { connect } = require("./Db.js");
const express = require('express')
const Produksitelur = require("./routes/ProduksiTelurController");
const Pendapatan = require("./routes/PendapatanController");
const pakancontroller = require("./routes/PakanController");
const SmovingAverage = require("./routes/SMovingAverageController");
const { authMiddleware, adminOnly } = require('./middleware/auth/MiddlewareUser');

const authController = require("./routes/UserController");
//#endregion imports

//#region conncection
const app = express()
const port = process.env.PORT || 3001;
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

app.use('/Api', Pendapatan);

app.use('/Api', pakancontroller);

app.use('/Api/v1', SmovingAverage);

app.use('/Api/auth', authController);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//#endregion routes