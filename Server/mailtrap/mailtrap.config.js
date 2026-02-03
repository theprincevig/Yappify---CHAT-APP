// --------------------
// Load environment variables
// --------------------
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: '.env.development' });
} else {
    require('dotenv').config({ path: '.env.production' });
}

const { MailtrapClient } = require('mailtrap');

const TOKEN = process.env.MAILTRAP_TOKEN;

if (!TOKEN) {
  throw new Error("MAILTRAP_TOKEN missing from .env!");
}

const mailtrapClient = new MailtrapClient({ token: TOKEN, });

const sender = {
  email: "hello@demomailtrap.co",
  name: "Yappify",
};

module.exports = { mailtrapClient, sender };