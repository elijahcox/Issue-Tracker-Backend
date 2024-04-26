const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(400).json({ "message": "username and password required" });
    }

    const foundUser = await User.findOne({ username: username }).exec();

    if (!foundUser) {
        return res.sendStatus(401);
    }

    try {
        const match = await bcrypt.compare(password, foundUser.password);
        if (match) {
            const role = foundUser.role;
            const accessToken = jwt.sign(
                { "UserInfo": { "username": foundUser.username, "role": role } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "2m" }
            ); //5-15min in prod

            const refreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            const result = await User.updateOne(
                { username: username },
                { refreshToken: refreshToken }
            );
            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "None" /*,secure:true*/
            }); //set http only refresh token for security
            res.status(200).json({ accessToken });
        } else {
            return res.sendStatus(401);
        }
    } catch (error) {
        return res.status(500).json({ "message": error.message });
    }
};

module.exports = { handleLogin };
