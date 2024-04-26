const User = require("../model/User");

const handleLogin = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(400).json({ "message": "username and password required" });
    }

    const foundUser = User.findOne({ username: username });
    console.log(foundUser);
};

module.exports = { handleLogin };
