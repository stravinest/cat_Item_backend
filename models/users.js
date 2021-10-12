'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        required: true,
        type: DataTypes.STRING,
      },
      nickname: {
        required: true,
        type: DataTypes.STRING,
      },
      userPw: {
        required: true,
        type: DataTypes.STRING,
      },
      salt: {
        required: true,
        type: DataTypes.STRING,
      },
      userDelType: {
        required: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Users',
    }
  );
  return Users;
};
