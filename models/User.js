const Sequelize = require("sequelize");
class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                // 테이블의 컬럼 정의
                user_id: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    unique: true
                },
                password: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(15),
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(45),
                    allowNull: false,
                },
                allow_random: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                birth: {
                    type: Sequelize.DATEONLY, // DATE without time
                    allowNull: true
                },
                image: { // image url
                    type: Sequelize.STRING(100),
                    allowNull: true,
                }
            }, 
            {   // 테이블 설정
                sequelize,
                timestamps: true, // true 이면 createdAt, updatedAt 컬럼 자동 추가
                underscored: true, // 테이블명과 컬럼명을 camelCase, snake_case 선택
                modelName: 'User', // 모델이름
                tableName: 'users', // 테이블이름
                paranoid: true, // true이면 deletedAt컬럼이 자동으로 생성되고 삭제시 삭제하지 않음
                charset: 'utf8', // 인코딩
                collate: 'utf8_general_ci', // 정렬시 비교기준
            }
        )
    }

    static associate(db) {
        // 테이블 간 관계를 정의
        // db.User.hasMany(db.Post, { foreignKey: 'user_id', sourceKey: 'user_id' });
    }
}

module.exports = User;