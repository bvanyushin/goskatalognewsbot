export const checkEnvParams: () => void = () => {
  if (!process.env.DB_PATH) {
    throw new Error("No path to database is provided, please set env variable DB_PATH.")
  }

  if (!process.env.API_TOKEN) {
    throw new Error(
      "No api token is provided, please set env variable API_TOKEN."
    );
  }

  if (!process.env.DAYS_TO_CHECK) {
    console.log("No period to check provided default value will be applied");
    console.log("If you want to change period, please set env variable DAYS_TO_CHECK");
  }

  if (process.env.ENVIRONMENT === "DEV") {
    console.log("Bot is running in dev mode, debug commands available");
}
}