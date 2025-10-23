const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class UserSubmission extends Model {}
UserSubmission.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  answers: { type: DataTypes.JSONB, allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, modelName: 'UserSubmission', tableName: 'user_submissions', timestamps: true });

module.exports = UserSubmission;
