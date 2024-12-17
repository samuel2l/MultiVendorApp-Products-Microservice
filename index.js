const express = require("express");

const app = express();
const mongoose = require("mongoose");
const print = console.log;
const cors = require("cors");

const productRoutes = require("./api/products");
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

const { CreateChannel } = require("./utils");

require("dotenv").config();
app.use(express.urlencoded({ extended: true }));

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URI);
    print("Connection sauce");

    const channel = await CreateChannel();

    

    await productRoutes(app, channel);
    app.listen(8002, () => {
      console.log("Customer is Listening to Port 8002");
    });
  } catch (err) {
    console.log("Failed to start app:", err);
  }
}

startApp();
