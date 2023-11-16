const Sequelize = require("sequelize");
class UserHasDiary extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                hidden: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                status: {
                    type: Sequelize.ENUM('pending', 'accept'),
                    allowNull: false,
                    defaultValue: 'pending',
                },
                accept_date: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: Sequelize.NOW
                }
            }, 
            {   // 테이블 설정
                sequelize,
                timestamps: true, // true 이면 createdAt, updatedAt 컬럼 자동 추가
                underscored: true, // 테이블명과 컬럼명을 camelCase, snake_case 선택
                modelName: 'UserHasDiary', // 모델이름
                tableName: 'userhasdiary', // 테이블이름
                paranoid: true, // true이면 deletedAt컬럼이 자동으로 생성되고 삭제시 삭제하지 않음
                charset: 'utf8', // 인코딩
                collate: 'utf8_general_ci', // 정렬시 비교기준
            }
        )
    }
}

module.exports = UserHasDiary;