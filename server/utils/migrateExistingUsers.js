/**
 * DevFlow AI - Migration Utility
 * Safely updates existing legacy users so their email is marked verified,
 * ensuring all existing managers, developers, projects, and tasks continue to work seamlessly.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const migrateUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ MONGO_URI is missing in environment variables.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find existing users who don't have emailVerified = true
    const usersToUpdate = await User.find({
      $or: [
        { emailVerified: { $exists: false } },
        { emailVerified: null },
        { emailVerified: false, emailVerificationTokenHash: { $exists: false } },
      ],
    });

    console.log(`Found ${usersToUpdate.length} legacy user(s) to verify.`);

    let updatedCount = 0;
    for (const user of usersToUpdate) {
      user.emailVerified = true;
      user.authProvider = user.authProvider || "local";
      await user.save();
      updatedCount++;
      console.log(`- Verified user: ${user.name} (${user.email}) [${user.role}]`);
    }

    console.log(`🎉 Successfully migrated ${updatedCount} existing user(s).`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrateUsers();
}

module.exports = migrateUsers;
