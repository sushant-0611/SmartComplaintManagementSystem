const mongoose = require("mongoose");

const DEFAULT_DB_NAME = "smart_complaints";

// Atlas connection strings often omit the database name, which makes Mongoose
// fall back to the "test" database. Insert a default db name before the query string.
const ensureDatabaseName = (uri, dbName) => {
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const pathPart = withoutProtocol.split("/")[1] || "";
  const existingDb = pathPart.split("?")[0];

  if (existingDb) return uri;

  if (uri.includes("/?")) return uri.replace("/?", `/${dbName}?`);
  if (uri.includes("?")) return uri.replace("?", `/${dbName}?`);
  if (uri.endsWith("/")) return uri.slice(0, -1) + `/${dbName}`;
  return `${uri}/${dbName}`;
};

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "MONGO_URI is not set. Add it to server/.env (MongoDB Atlas connection string)."
    );
    process.exit(1);
  }

  uri = ensureDatabaseName(uri, DEFAULT_DB_NAME);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
