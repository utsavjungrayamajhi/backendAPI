"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      // Define associations here
      Payment.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
      });
    }
  }

  Payment.init(
    {
      transactionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Order",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dataFromVerificationReq: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      apiQueryFromUser: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      paymentGateway: {
        type: DataTypes.ENUM("khalti", "esewa", "connectIps"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("success", "pending", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: true,
    }
  );

  return Payment;
};
