module.exports = {
  async up(db, client) {
    const result = await db.collection("users").updateMany(
      {},
      {
        $unset: {
          migration_test: 1,
        },
      }
    );

    console.log("UP: Removed migration_test field from users collection.", result);
  },

  async down(db, client) {
    const result = await db.collection("users").updateMany(
      {},
      {
        $set: {
          migration_test: "HELLO",
        },
      }
    );

    console.log("DOWN: Restored migration_test field in users collection.", result);
  },
};

