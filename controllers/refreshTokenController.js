const User = require("../model/User");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
    //this function is manually called, the goal is to return a refreshed access token, contingent on verification of cookie refresh token
    //the goal is not to refresh the refresh token, that is *only* done upon logout
    const cookies = req.cookies;
    if (cookies.jwt == null) {
        return res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    if (!foundUser) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
        const role = foundUser.role;
        const userID = foundUser._id.toString();
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": decoded.username,
                    "role": role,
                    "userID": userID
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "2m" }
        );
        res.json({ accessToken });
    });
};

module.exports = { handleRefreshToken };
