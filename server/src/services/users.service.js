const { modelNames } = require("mongoose");
const User = require("../models/User");

async function createUser({ name, pushToken }) {
    if (!name || typeof name !== "string") {
        const err = new Error("Name is required");
        err.status = 400;
        throw err;
    }

    const user = await User.create({
        name: name.trim(),
        pushToken: pushToken || null, 
        groupIds: [],
    });

    return user;
}

module.exports = { createUser };
