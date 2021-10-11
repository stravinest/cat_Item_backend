'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Replies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Replies.init(
    {
      replyId: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        required: true,
        type: DataTypes.STRING,
      },
      postId: {
        required: true,
        type: DataTypes.STRING,
      },
      replyContent: {
        required: true,
        type: DataTypes.STRING,
      },
      replyDelType: {
        required: true,
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Replies',
    }
  );
  return Replies;
};
