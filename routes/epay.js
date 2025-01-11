const router = require("express").Router();

const { getEsewaPaymentHash, verifyEsewaPayment } = require("./esewa");
const { Payment } = require("../models"); // Adjusted to match the MySQL model for payments
const { Order } = require("../models"); // Adjusted model path

router.post("/initialize-esewa", async (req, res) => {
  try {
    const { id, totalPrice } = req.body;

    // Validate item exists and the price matches
    const orderData = await Order.findOne({
      where: {
        id: id, // Ensure this matches the field in your Item table
        totalPrice: totalPrice, // Validate price matches
      },
    });

    if (!orderData) {
      return res.status(400).send({
        success: false,
        message: "Item not found or price mismatch.",
      });
    }

    // Initiate payment with eSewa
    const paymentInitiate = await getEsewaPaymentHash({
      amount: totalPrice,
      transaction_uuid: orderData.customerId,
    });

    // Respond with payment details
    res.json({
      success: true,
      payment: paymentInitiate,
      orderData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/complete-payment", async (req, res) => {
  const { data } = req.query; // Data received from eSewa's redirect

  try {
    // Verify payment with eSewa
    const paymentInfo = await verifyEsewaPayment(data);
    // Find the purchased item using the transaction UUID
    const orderData = await Order.findOne({
      where: { customerId: paymentInfo.response.transaction_uuid },
    });

    if (!orderData) {
      return res.status(500).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // Create a new payment record in the database
    const paymentData = await Payment.create({
      transactionId: paymentInfo.decodedData.transaction_code,
      orderId: orderData.id,
      amount: orderData.totalPrice,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "esewa",
      status: "success",
    });

    // Update the purchased item status to 'completed'
    await Order.update(
      { status: "completed" },
      { where: { id: orderData.id } }
    );

    // Respond with success message
    setTimeout(() => {
      res.redirect("http://localhost:5173/");
    }, 5000);

    // res.json({
    //   success: true,
    //   message: "Payment successful",
    //   paymentData,
    // });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
      error: error.message,
    });
  }
});

module.exports = router;
