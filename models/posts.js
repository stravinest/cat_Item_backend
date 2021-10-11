'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Posts.init(
    {
      postId: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        required: true,
        type: DataTypes.STRING,
      },
      title: {
        required: true,
        type: DataTypes.STRING,
      },
      content: {
        required: true,
        type: DataTypes.STRING,
      },
      image: {
        required: true,
        type: DataTypes.STRING,
      },
      postDelType: {
        required: true,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Posts',
    }
  );
  return Posts;
};
