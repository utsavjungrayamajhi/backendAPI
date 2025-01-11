"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transactionId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders", // Note: Table names in Sequelize are pluralized by default, so ensure "orders" exists
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      dataFromVerificationReq: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      apiQueryFromUser: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      paymentGateway: {
        type: Sequelize.ENUM("khalti", "esewa", "connectIps"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("success", "pending", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("payments");
  },
};
