// Connect to database
use('PetShop');

// Update all existing users
// Set loginAttempts = 0 (no failed attempts yet)
// Set lockUntil = null (not locked)
db.users.updateMany(
  {},  // All documents
  {
    $set: {
      loginAttempts: 0,
      lockUntil: null,
    }
  }
);

console.log("✅ Migration completed: Added loginAttempts and lockUntil to all users");

// Verify
const result = db.users.findOne({});
console.log("Sample user after migration:");
console.log({
  email: result.email,
  loginAttempts: result.loginAttempts,
  lockUntil: result.lockUntil
});
