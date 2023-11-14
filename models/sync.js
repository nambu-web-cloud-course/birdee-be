const { sequelize } = require('./index.js');
const sync = () => {
    // force: true이면 기존 테이블 강제 업데이트, 기존 데이터 유지 x 
    // alter: true이면 가능한 조건이면 기존 테이블에 수정, 기존 데이터는 유지
    sequelize
        .sync({ force: false })
        .then(() => {
            console.log('데이터베이스 생성완료');
        })
        .catch((err) => {
            console.error(err);
        });
}

module.exports = sync;