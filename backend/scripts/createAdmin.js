require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User'); // Adjust path as needed

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const email = 'admin@fleetsphere.demo';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`User ${email} already exists. Skipping creation.`);
    } else {
      console.log(`Creating super admin: ${email}`);
      const adminUser = new User({
        name: 'Super Admin',
        email: email,
        password: 'Demo@12345',
        role: 'SUPER_ADMIN',
        phone: '9999999999',
        status: 'ACTIVE'
      });
      // the pre-save hook will hash the password securely
      await adminUser.save();
      console.log('✅ Super Admin created successfully');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
