'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users,{
        targetKey: 'userId',
        foreignKey: 'userId',
      })
      this.belongsTo(models.Posts,{
        targetKey: 'postId',
        foreignKey: 'postId',
        onDelete: 'CASCADE'
      })
    }
  }
  Comments.init({
    commentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    postId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Posts',
        key: 'postId',
      },
      onDelete: 'cascade',
    },
    comment: {
      allowNull: false,
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW

    }
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};