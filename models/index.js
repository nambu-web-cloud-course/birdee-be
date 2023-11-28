const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

const User = require('./User.js');
const Diary = require('./Diary.js');
const UserHasDiary = require('./UserHasDiary.js');
const Page = require('./Page.js');
const Category = require('./Category.js');

db.User = User;
db.Diary = Diary;
db.UserHasDiary = UserHasDiary;
db.Page = Page;
db.Category = Category;

User.init(sequelize);
Diary.init(sequelize);
UserHasDiary.init(sequelize);
Page.init(sequelize);
Category.init(sequelize);
  
User.associate(db);
Diary.associate(db);
UserHasDiary.associate(db);
Page.associate(db);
Category.associate(db);

module.exports = db;
