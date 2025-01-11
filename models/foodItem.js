"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FoodItem.init(
    {
      name: { type: DataTypes.STRING },
      price: { type: DataTypes.DECIMAL },
      category: { type: DataTypes.STRING },
      available: { type: DataTypes.BOOLEAN },
      img: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "FoodItem",
      tableName: "fooditems",
    }
  );
  return FoodItem;
};
