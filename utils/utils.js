const bcrypt = require('bcrypt');

const createHash = async (password, saltAround) => {
    let hashed = bcrypt.hashSync(password, saltAround);
    console.log(`${password} : ${hashed}`);
    return hashed;
};


module.exports = {
    createHash,
};