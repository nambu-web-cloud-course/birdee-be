const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secret = process.env.JWT_SECRET;
 
const isAuth = async (req, res, next) => {
    const auth = req.get('Authorization');
    if (!(auth && auth.startsWith('Bearer'))) {
        return res.send({message: 'Auth error'})
    }

    const token = auth.split(' ')[1];
    jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            return res.send({message: 'Auth error'})
        } else {
            const user_id = decoded.uid;
            const role = decoded.rol;
            req.user_id = user_id;
            req.role = role;
            next();
        }
    })
};

module.exports = isAuth;