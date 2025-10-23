const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class PlacementTest extends Model {}
PlacementTest.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT }
}, { sequelize, modelName: 'PlacementTest', tableName: 'placement_tests', timestamps: true });

module.exports = PlacementTest;
