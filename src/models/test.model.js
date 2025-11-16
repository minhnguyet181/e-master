// src/models/test.model.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Test extends Model {}

Test.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    name: { type: DataTypes.STRING(255), allowNull: false },

    test_type: {
      type: DataTypes.ENUM('listening', 'reading', 'writing', 'speaking'),
      allowNull: false,
    },

    description: { type: DataTypes.TEXT, allowNull: true },

    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 60 },

    level: {
      type: DataTypes.STRING(50),
      defaultValue: 'IELTS',
    }
  },
  {
    sequelize,
    modelName: 'Test',
    tableName: 'tests',
    timestamps: true,
  }
);

module.exports = Test;
