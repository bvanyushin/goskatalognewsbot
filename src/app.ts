import { initDatabase } from "./db";
import { CronJob } from "cron";
import { compileIssue } from "./issue";
import { getBot } from "./bot";

const token = "";
const debugMode = true;

async function doStuff() {
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

