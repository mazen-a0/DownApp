
// create Express app + middleware, objective: run npm run dev and see server running, port 3000
const express = require("express");
const cors = require("cors");
const usersRoutes = require("./routes/users.routes");

const app = express(); //creates the app

//middleware
app.use(cors());
app.use(express.json()); //lets express read JSON bodies

const requireUser = require("./middleware/requireUser");

//test route
app.get("/health", (req, res) => { // test endpoint so we know the server works
    res.json({ ok: true});
});

// PUBLIC routes (no x-user-id required)
app.use("/users", usersRoutes);

// require user for everything else (MVP)
app.use(requireUser);

//app.get("/me", (req, res) => {
//    res.json({ userId: req.userId });
//}); former test route

module.exports = app;

