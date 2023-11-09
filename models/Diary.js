const Sequelize = require("sequelize");
class Diary extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                // 테이블의 컬럼 정의
                title: {
                    type: Sequelize.STRING(15),
                    allowNull: false
                },
                color: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                deleted: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                }, 
                is_editable: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                }, 
                is_deletable: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                }
            }, 
            {   // 테이블 설정
                sequelize,
                timestamps: true, // true 이면 createdAt, updatedAt 컬럼 자동 추가
                underscored: true, // 테이블명과 컬럼명을 camelCase, snake_case 선택
                modelName: 'Diary', // 모델이름
                tableName: 'diary', // 테이블이름
                paranoid: true, // true이면 deletedAt컬럼이 자동으로 생성되고 삭제시 삭제하지 않음
                charset: 'utf8', // 인코딩
                collate: 'utf8_general_ci', // 정렬시 비교기준
            }
        )
    }

    static associate(db) {
        // 테이블 간 관계를 정의
        // db.Post.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'user_id' });
    }
}

module.exports = Diary;