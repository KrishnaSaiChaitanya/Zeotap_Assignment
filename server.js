const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const ruleRoutes = require("./routes/rules");
const weatherRoutes = require("./routes/weather");
const alertRoutes = require("./routes/alerts");
const { mongodbUrl } = require("./config");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

mongoose.connect(
  "mongodb+srv://chaitanya:chaitanya2105@chaitanya.rshhe5n.mongodb.net/zeotap",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use("/api/rules", ruleRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/alerts", alertRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
