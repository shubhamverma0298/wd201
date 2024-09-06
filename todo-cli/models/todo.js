'use strict';
const { Op } = require('sequelize');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log('My Todo list \n');

      console.log('Overdue');
      const overDue = await Todo.overdue() ;
      overDue.forEach((item) => {
        console.log(item.displayableString()) ;
      });
      console.log('\n');

      console.log('Due Today');
      const Todaydue = await Todo.dueToday() ;
      Todaydue.forEach((item) => {
        console.log(item.displayableString()) ;
      });
      console.log('\n');

      console.log('Due Later');
      const Laterdue = await Todo.dueLater() ;
      Laterdue.forEach((item) =>{
        console.log(item.displayableString()) ;
      })
    }

    static async overdue() {
      const todo = Todo.findAll({
        where: {
          dueDate: {[ Op.lt ] : new Date(),},
        }
      });
      return await todo ;
    }

    static async dueToday() {
      const today = new Date().toISOString().split('T')[0] ;
      const todos = Todo.findAll({
        where: {
          dueDate: today ,
          completed: false ,
        }
      });
      return await todos ;
    }

    static async dueLater() {
      const dueLate = Todo.findAll({
        where: {
          dueDate: {[ Op.gt ] : new Date() ,},
          completed: false ,
        }
      });
      return await dueLate ;
    }

    static async markAsComplete(id) {
      const done = Todo.update({completed: true}, {
        where: {
          id: id ,
        }
      });
      return await done ;
    }

   displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      let todaydate = new Date().toISOString().split('T')[0] ;
      let OverDue = this.dueDate > todaydate ;

      if(this.dueDate === todaydate ){
        return `${this.id}. ${checkbox} ${this.title}`;
      } else if( this.completed && OverDue ){
        return `${this.id}. [x] ${this.title} ${this.dueDate}`;
      } else{
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
      }  
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    },
  );
  return Todo;
};