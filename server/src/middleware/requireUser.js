module.exports = function requireUser(req, res, next) {
    const userId = req.header("x-user-id");

//reads header x-user-id, attaches req.userId for later use
    if (!userId) {
        return res.status(401).json({
            error: "NO_USER_ID",
            message: "Missing x-user-id header"
        });
    }

    req.userId = userId; 
    next();
}; 