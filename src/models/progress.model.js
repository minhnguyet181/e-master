const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class Progress extends Model {}
Progress.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 }
}, 
{ sequelize, modelName: 'Progress', tableName: 'progress', timestamps: true });

module.exports = Progress;
