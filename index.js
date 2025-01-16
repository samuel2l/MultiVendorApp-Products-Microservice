const express = require("express");

const app = express();
const mongoose = require("mongoose");
const print = console.log;
const cors = require("cors");
const port=process.env.PORT||8002
const productRoutes = require("./api/products");
app.use(express.json());
app.use(cors());

// app.use(cors({
//   origin: ['http://localhost:3000', 'https://multivendorplatform-shopping-frontend.onrender.com'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));


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
    app.listen(port, () => {
      console.log(`User Service is Listening to Port ${8002}`);
    });
  } catch (err) {
    console.log("Failed to start app:", err);
  }
}

startApp();
