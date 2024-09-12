'use strict';
const { Op } = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User,{
        foreignKey:'userId'
      })
    }
    static addTodo({title,dueDate,userId}){
      return this.create({title: title,dueDate:dueDate,completed: false,userId});
    }
    markAsCompleted(){
      return this.update({completed: true});
    }
    static getTodos(userId){
       userId;
      return this.findAll();
    }
    static async overdue(userId) {
      const today = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: today,
          },
          userId,
          completed: false,
        },
      });
    }
    static async dueToday(userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.findAll({
        where: {
          userId,
          dueDate: today,
          completed: false,
        },
      });
    }
    static async dueLater(userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: today,
          },
          userId,
          completed: false,
        },
      });
    }
    static async remove(id, userId){
      return this.destroy({
        where:{
          id,
          userId,
        },
      });
    }
    static async completed(userId) {
      return this.findAll({
        where: {
          userId,
          completed: true,
        },
      });
    }
    setCompletionStatus() {
      return this.update({ completed: !this.completed });
    }
  }
  Todo.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};