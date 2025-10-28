const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class Test extends Model {}
Test.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false }
}, 
{ sequelize, modelName: 'Test', tableName: 'tests', timestamps: true });

module.exports = Test;
