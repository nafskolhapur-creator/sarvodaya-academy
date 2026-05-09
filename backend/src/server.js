import app from "./app.js";
import connectDatabase from "./config/db.js";
import { assertProductionEnv, env } from "./config/env.js";
import ensureAdminUser from "./seeders/ensureAdminUser.js";
import ensureCatalogData from "./seeders/ensureCatalogData.js";
import { startFeeReminderScheduler } from "./services/feeScheduler.js";

const startServer = async () => {
  assertProductionEnv();
  await connectDatabase();
  await ensureAdminUser();
  await ensureCatalogData();
  startFeeReminderScheduler();

  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
};

startServer();
