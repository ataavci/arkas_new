require("dotenv").config();
const { Sequelize } = require("sequelize");

// Sequelize bağlantısı
const sequelize = new Sequelize(
  process.env.DB_NAME || "arkas_new",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "", // Şifre yoksa boş bırakılır
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

// Veritabanı bağlantısını test eden fonksiyon
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("\x1b[32m%s\x1b[0m", "Veritabanı bağlantısı başarılı!");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Veritabanına bağlanırken bir hata oluştu:", error.message);
  }
};

testDatabaseConnection();

module.exports = sequelize;
