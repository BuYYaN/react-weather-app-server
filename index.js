const cors = require("cors");
const express = require("express");
const PORT = 4000;

const weatherRouter = require("./express/weather.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/weather", weatherRouter);

app.listen(process.env.PORT || PORT, () => console.log("Listening..."));
