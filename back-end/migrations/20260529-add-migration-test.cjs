module.exports = {
  async up(db, client) {
    const result = await db.collection("users").updateMany(
      {},
      {
        $set: {
          migration_test: "HELLO",
        },
      }
    );

    console.log("UP:", result);
  },

  async down(db, client) {
    const result = await db.collection("users").updateMany(
      {},
      {
        $unset: {
          migration_test: 1,
        },
      }
    );

    console.log("DOWN:", result);
  },
};