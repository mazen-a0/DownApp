const express = require("express");
const { createUser, getMyHere } = require("../controllers/users.controller");

const router = express.Router();

router.post("/", createUser);
router.post("/upsert", createUser); 

router.get("/me/here", getMyHere);

module.exports = router;