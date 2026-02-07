// create Express app + middleware, objective: run npm run dev and see server running, port 3000
const express = require("express");
const cors = require("cors");

const app = express(); //creates the app

//middleware
app.use(cors());
app.use(express.json()); //lets express read JSON bodies

//test route
app.get("/health", (req, res) => { // test endpoint so we know the server works
    res.json({ ok: true});
});

module.exports = app;
