import { Op } from '@sequelize/core';

'use strict';
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
      // define association here
    }
    static addTodo({title,dueDate}){
      return this.create({title: title,dueDate:dueDate,completed: false});
    }
    markAsCompleted(){
      return this.update({completed: true});
    }
    static getTodos(){
      return this.findAll();
    }
    static async overdue() {
      const today = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [sequelize.Op.lt]: today,
          },
          completed: false,
        },
      });
    }
    static async dueToday() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.findAll({
        where: {
          dueDate: today,
          completed: false,
        },
      });
    }
    static async dueLater() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.findAll({
        where: {
          dueDate: {
            [sequelize.Op.gt]: today,
          },
          completed: false,
        },
      });
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};