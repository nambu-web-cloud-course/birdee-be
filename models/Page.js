const Sequelize = require("sequelize");
class Page extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                // 테이블의 컬럼 정의
                subject: {
                    type: Sequelize.STRING(45),
                    allowNull: false
                },
                contents: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    charset: 'utf8mb4',
                    collate: 'utf8mb4_unicode_ci'
                },
                deleted: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            }, 
            {   // 테이블 설정
                sequelize,
                timestamps: true, // true 이면 createdAt, updatedAt 컬럼 자동 추가
                underscored: true, // 테이블명과 컬럼명을 camelCase, snake_case 선택
                modelName: 'Page', // 모델이름
                tableName: 'pages', // 테이블이름
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            }
        )
    }

    static associate(db) {
        // 테이블 간 관계를 정의
        db.Page.belongsTo(db.Diary, { foreignKey: 'diary_id', sourceKey: 'id' });
        db.Page.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });
        
    }
}

module.exports = Page;