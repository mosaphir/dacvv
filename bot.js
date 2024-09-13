require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Sample products
const products = [
  { id: 1, name: 'Product A', price: 1000 }, // Price in cents (USD 10.00)
  { id: 2, name: 'Product B', price: 2000 }, // Price in cents (USD 20.00)
  { id: 3, name: 'Product C', price: 3000 }  // Price in cents (USD 30.00)
];

// Start command
bot.start((ctx) => {
  ctx.reply('Welcome to our store! Use /shop to view products.');
});

// Show available products
bot.command('shop', (ctx) => {
  let message = 'Available Products:\n\n';
  products.forEach((product) => {
    message += `${product.name} - $${(product.price / 100).toFixed(2)}\n`;
    message += `/buy_${product.id} - Buy Now\n\n`;
  });
  ctx.reply(message);
});

// Handle purchase commands
products.forEach((product) => {
  bot.command(`buy_${product.id}`, async (ctx) => {
    try {
      const chatId = ctx.chat.id;
      const priceInUSD = product.price / 100;

      const paymentLink = await createCryptoPaymentLink(product.name, priceInUSD, chatId);
      
      ctx.replyWithMarkdown(
        `You are purchasing *${product.name}* for $${priceInUSD}. [Pay Now](${paymentLink})`
      );
    } catch (error) {
      console.error(error);
      ctx.reply('Error processing your order. Please try again later.');
    }
  });
});

// Function to create CryptoBot payment link
async function createCryptoPaymentLink(productName, priceInUSD, userId) {
  const CRYPTOPAY_API_KEY = process.env.CRYPTOPAY_API_KEY;
  const CRYPTOPAY_BOT_USERNAME = process.env.CRYPTOPAY_BOT_USERNAME;
  
  const amount = priceInUSD; // Payment amount in USD
  const payload = `user_${userId}_product_${productName}`; // Payload to track the payment

  const response = await axios.post(
    `https://pay.crypt.bot/api/createInvoice`,
    {
      asset: 'USDT',  // You can use other crypto assets supported by CryptoBot
      amount: amount,
      description: `Payment for ${productName}`,
      payload: payload,
      paid_btn_name: "viewItem",
      paid_btn_url: "https://yourstore.com/thankyou"
    },
    {
      headers: {
        'Crypto-Pay-API-Token': CRYPTOPAY_API_KEY
      }
    }
  );

  return `https://t.me/${CRYPTOPAY_BOT_USERNAME}?start=${response.data.result.invoice_id}`;
}

// Start the bot
bot.launch();

console.log('Bot is running...');
