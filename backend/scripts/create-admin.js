/**
 * Create a platform admin user.
 * Usage: node scripts/create-admin.js admin@example.com SecurePassword123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const run = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.password = password;
    await user.save();
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    user = await User.create({
      username: email.split('@')[0],
      email,
      password,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'admin',
    });
    console.log(`Created admin user: ${email}`);
  }

  await mongoose.connection.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
