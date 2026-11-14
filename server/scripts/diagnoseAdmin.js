import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const diagnose = async () => {
  try {
    await connectDB();

    const email = 'ricky9334p@gmail.com';
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      console.log(`Diagnostic Result: Admin with email ${email} NOT found in database.`);
    } else {
      console.log(`Diagnostic Result: Admin found successfully.`);
      console.log(`- ID: ${admin._id}`);
      console.log(`- Name: ${admin.name}`);
      console.log(`- Email: ${admin.email}`);

      const pwd = admin.password;
      const isBcryptHash = typeof pwd === 'string' && (pwd.startsWith('$2a$') || pwd.startsWith('$2b$'));
      console.log(`- Password stored as valid bcrypt hash: ${isBcryptHash}`);
      if (!isBcryptHash) {
        console.log(`- WARNING: The stored password in MongoDB is NOT a valid bcrypt hash! This means it was likely inserted as plaintext directly into the database without triggering Mongoose pre-save hashing middleware.`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Diagnosis error:', error.message);
    process.exit(1);
  }
};

diagnose();
