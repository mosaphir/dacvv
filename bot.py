import telebot
import requests

# Telegram bot token
BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'
bot = telebot.TeleBot(BOT_TOKEN)

# CryptoBot API token
CRYPTOPAY_API_KEY = 'YOUR_CRYPTOPAY_API_KEY'
CRYPTOPAY_API_URL = 'https://pay.crypt.bot/api/'

# Sample products (name: price in USDT)
products = {
    "Product 1": {"price": 5, "description": "Description of product 1"},
    "Product 2": {"price": 10, "description": "Description of product 2"},
    "Product 3": {"price": 20, "description": "Description of product 3"}
}

# Start command
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.send_message(
        message.chat.id,
        "Welcome to the shop! Type /products to see our catalog."
    )

# List products
@bot.message_handler(commands=['products'])
def list_products(message):
    product_list = "Available products:\n\n"
    for product, details in products.items():
        product_list += f"{product}: {details['price']} USDT\n"
    product_list += "\nReply with /buy <Product Name> to purchase."
    bot.send_message(message.chat.id, product_list)

# Handle buying a product
@bot.message_handler(commands=['buy'])
def buy_product(message):
    try:
        product_name = message.text.split("/buy ", 1)[1]
        if product_name not in products:
            bot.send_message(message.chat.id, "Product not found. Please try again.")
            return

        product = products[product_name]
        create_payment(message.chat.id, product_name, product['price'])

    except IndexError:
        bot.send_message(message.chat.id, "Please specify a product name. Example: /buy Product 1")

# Create a payment link using CryptoBot API
def create_payment(chat_id, product_name, amount):
    payload = {
        "token": CRYPTOPAY_API_KEY,
        "currency": "USDT",
        "amount": amount,
        "description": f"Payment for {product_name}",
        "paid_btn_name": "viewItem",
        "paid_btn_url": "https://example.com",  # URL after payment, can be a receipt page
        "payload": product_name
    }

    response = requests.post(f"{CRYPTOPAY_API_URL}createInvoice", json=payload)

    if response.status_code == 200:
        data = response.json()
        payment_url = data['result']['pay_url']
        bot.send_message(chat_id, f"Click the link to pay for {product_name}: {payment_url}")
    else:
        bot.send_message(chat_id, "Failed to create payment. Please try again later.")

# Run the bot
bot.polling()
