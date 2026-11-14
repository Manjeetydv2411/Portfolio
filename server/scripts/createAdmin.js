import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || 'Portfolio Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env file.');
      process.exit(1);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      console.log(`Admin user with email "${normalizedEmail}" already exists. Skipping creation.`);
      process.exit(0);
    }

    // Create admin (password will be automatically hashed by Mongoose pre-save hook)
    await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    console.log(`Successfully created admin user: ${normalizedEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
