"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.FoodItem, { foreignKey: "itemId" });
    }
  }
  Cart.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fooditems",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Cart",
    }
  );
  return Cart;
};
