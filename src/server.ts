import { app } from "./app";
import { AppDataSource } from "./ormconfig";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }
};

startServer();
