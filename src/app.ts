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
  await initDatabase();
  const bot = getBot(token);

  const sendIssue = async () => {
    const issue = await compileIssue();
    issue.mailList.forEach(userId => bot.sendMessage(userId, issue.message))
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

