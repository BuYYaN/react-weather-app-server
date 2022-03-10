const { default: axios } = require("axios");
const { v4: uuidv4 } = require("uuid");
const db = require("../firebase");

const getWeatherHistory = async (req, res) => {
  const limit = req.query.limit ?? Infinity;

  const weatherRef = db.collection("weather-history");
  const snapshot = await weatherRef.get();

  const historyArr = [];

  snapshot.forEach((doc) => {
    historyArr.push(doc.data());
  });

  historyArr.sort((data1, data2) => data2.time - data1.time);

  res.json(historyArr.slice(0, limit));
};

const getWeatherInfo = async (req, res) => {
  const apiKey = req.query.apiKey;
  const lon = req.query.lon;
  const lat = req.query.lat;

  const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const { data } = await axios.get(url);
    const formattedData = {
      lon,
      lat,
      id: uuidv4(),
      temp: data.main.temp,
      clouds: data.clouds.all,
      wind: data.wind.speed,
      description: data.weather[0].description,
      name: data.name,
      time: new Date().getTime(),
    };

    const weatherRef = await db
      .collection("weather-history")
      .doc(formattedData.name);

    const doc = await weatherRef.get();

    if (doc.exists) {
      const { totalQueries } = (await doc).data();
      const updatedInfo = {
        totalQueries: totalQueries + 1,
        time: formattedData.time,
      };

      weatherRef.update(updatedInfo);

      formattedData.totalQueries = updatedInfo.totalQueries;
    } else {
      weatherRef.set({ ...formattedData, totalQueries: 1 });
      formattedData.totalQueries = 1;
    }

    res.json({ data: formattedData });
  } catch (error) {
    res.status(401).json({ error });
  }
};

module.exports = { getWeatherInfo, getWeatherHistory };
