const express = require("express");
const { createUser } = require("../controllers/users.controller");

const router = express.Router();

router.post("/", createUser);
router.post("/upsert", createUser); 

module.exports = router;