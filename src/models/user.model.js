// src/models/user.model.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true }, 
    googleId: { type: DataTypes.STRING(255), allowNull: true },
    goal: { type: DataTypes.STRING(255), allowNull: true }, 
    band_target: { type: DataTypes.STRING(50), allowNull: true },
    study_hours_per_day: { type: DataTypes.INTEGER, allowNull: true },
    reason: { type: DataTypes.STRING(255), allowNull: true },
    ai_recommendation: { type: DataTypes.TEXT, allowNull: true },

  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

module.exports = User;
