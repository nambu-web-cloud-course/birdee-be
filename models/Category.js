const Sequelize = require("sequelize");
class Category extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                // 테이블의 컬럼 정의
                cname: {
                    type: Sequelize.STRING(15),
                    allowNull: false
                }
            }, 
            {   // 테이블 설정
                sequelize,
                timestamps: true, // true 이면 createdAt, updatedAt 컬럼 자동 추가
                underscored: true, // 테이블명과 컬럼명을 camelCase, snake_case 선택
                modelName: 'Category', // 모델이름
                tableName: 'category', // 테이블이름
                paranoid: true, // true이면 deletedAt컬럼이 자동으로 생성되고 삭제시 삭제하지 않음
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            }
        )
    }

    static associate(db) {
        db.Category.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'user_id' });
        db.Category.hasMany(db.UserHasDiary, { foreignKey: 'category_id', sourceKey: 'id' });
    }
}

module.exports = Category;