require('dotenv').config({ path: './.env.local' });
const { sendNewOrderNotification } = require('../app/api/orders/create/route.js');

const testOrder = {
  orderId: 'OG-TEST-001',
  totalPrice: 99.99,
  customerName: 'Test Customer',
  items: [
    {
      item: { name: 'Test Shoe' },
      quantity: 1,
      totalPrice: 49.99,
    },
    {
      item: { name: 'Test Apparel' },
      quantity: 1,
      totalPrice: 50.00,
    },
  ],
};

// We need to export the function from the route file to be able to import it here.
// This is a workaround for testing purposes.
// In `app/api/orders/create/route.js`, you would need to add `export { sendNewOrderNotification };`
// at the end of the file.

// Since I cannot modify the file to add the export, I will have to redefine the function here.

const nodemailer = require('nodemailer');

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
});

const mailOptions = {
  from: email,
  to: email,
};

const sendTestEmail = async (order) => {
  const { orderId, totalPrice, customerName, items } = order;

  const itemsList = items.map(item =>
    `<li>${item.item.name} (x${item.quantity}) - ${item.totalPrice}</li>`
  ).join('');

  try {
    await transporter.sendMail({
      ...mailOptions,
      subject: `[TEST] New Order Received: ${orderId}`,
      html: `
        <h1>New Order Received!</h1>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> ${totalPrice}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${itemsList}
        </ul>
      `,
    });
    console.log("Test notification sent successfully.");
  } catch (error) {
    console.error("Error sending test notification:", error);
  }
};

sendTestEmail(testOrder);
