module.exports = {
  async up(db, client) {
    const result = await db.collection("users").updateMany(
      {},
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
        },
      }
    );

    console.log("✅ Migration completed: Added loginAttempts and lockUntil to all users");
    console.log(`Modified ${result.modifiedCount} documents`);

    const sampleUser = await db.collection("users").findOne({});

    console.log("Sample user after migration:");
    console.log({
      email: sampleUser?.email,
      loginAttempts: sampleUser?.loginAttempts,
      lockUntil: sampleUser?.lockUntil,
    });
  },

  async down(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $unset: {
          loginAttempts: "",
          lockUntil: "",
        },
      }
    );

    console.log("↩️ Rollback completed");
  },
};