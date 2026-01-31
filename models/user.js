'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, { through: "UserRoles" });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    refreshToken: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};