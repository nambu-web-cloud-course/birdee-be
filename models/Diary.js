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
                    type: Sequelize.ENUM('undeleted', 'scheduled', 'completed'),
                    allowNull: false,
                    defaultValue: 'undeleted',
                },
                delete_at: { // 삭제 예정 날짜. deleted가 'scheduled'로 바뀐 시각 + 7일이 입력됨
                    type: Sequelize.DATE,
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
                tableName: 'diaries', // 테이블이름
                // paranoid: true, // true이면 deletedAt컬럼이 자동으로 생성되고 삭제시 삭제하지 않음
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            }
        )
    }

    static associate(db) {
        // 테이블 간 관계를 정의
        db.Diary.belongsToMany(db.User, {
            through: db.UserHasDiary,
            foreignKey: 'diary_id',
            sourceKey: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
         });
         db.Diary.hasOne(db.Page, { foreignKey: 'diary_id', sourceKey: 'id' });
    }
}

module.exports = Diary;