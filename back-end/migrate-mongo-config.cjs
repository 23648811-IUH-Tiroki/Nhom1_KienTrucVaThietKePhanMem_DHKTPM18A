require("dotenv").config();

module.exports = {
  mongodb: {
    url: process.env.MONGO_URI,
    options: {},
  },

  migrationsDir: "migrations",
  changelogCollectionName: "migrations_changelog",
  migrationFileExtension: ".cjs",
};