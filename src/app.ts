import { initDatabase } from "./db";
import { CronJob } from "cron";
import { compileIssue } from "./issue";
import { getBot } from "./bot";

const token = process.env.API_TOKEN;

if (!token) {
  throw new Error(
    "No api token is provided, please set env variable API_TOKEN."
  );
}

async function doStuff() {
  const debugMode = process.env.ENVIRONMENT === "DEV";

  await initDatabase();
  const bot = getBot(token, debugMode);

  const sendIssue = async () => {
    const issue = await compileIssue();
    issue.mailList.forEach(userId => bot.sendMessage(userId, issue.message))
  }

  if (debugMode) {
    bot.onText(/\/debug_send/, sendIssue);
  }

  new CronJob(
    "00 00 7 * * *",
    sendIssue,
    null,
    true,
    "UTC"
  );
}

doStuff();

