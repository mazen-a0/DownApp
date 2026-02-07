require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");

const PORT = process.env.PORT || 3000;

async function start() {
    await connectMongo();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});





//const app = require("./app");

//const PORT = process.env.PORT || 3000;

//app.listen(PORT, () => {
//    console.log(`Server running on port ${PORT}`);
//});

// imports the app you just made 
// starts listening on port 3000
// logs a message so you know it worked

//ok now we have a backend server, a place to add routes, and proof that the setup works

