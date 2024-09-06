const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("./connectDB.js");

class Todo extends Model {
  static async addTask(params){
    return await Todo.create(params);
  }
  displayableString(){
    let checkbox = this.completed ? "[X]" : "[]";
    return `${this.id},${this.title}-${this.dueDate}`
  }
}
Todo.init(
  {
    // Model attributes are defined here
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
    },
    completed: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
  }
);
module.exports = Todo;
Todo.sync();
