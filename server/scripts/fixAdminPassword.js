import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

const fixPassword = async () => {
  try {
    await connectDB();

    const email = 'ricky9334p@gmail.com';
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      console.error(`Admin with email ${email} not found.`);
      process.exit(1);
    }

    const newPassword = process.env.ADMIN_PASSWORD;

    if (!newPassword || !newPassword.trim()) {
      console.error('Error: ADMIN_PASSWORD environment variable is required to update the admin password.');
      process.exit(1);
    }

    // Setting password and calling save() triggers the Mongoose pre-save bcrypt hashing hook
    admin.password = newPassword.trim();
    await admin.save();

    console.log(`Successfully re-hashed and updated password for admin: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error.message);
    process.exit(1);
  }
};

fixPassword();
