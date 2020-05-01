import { initDatabase } from "./db";
import {checkEnvParams} from './checkEnvParams';
import { CronJob } from "cron";
import { compileIssue } from "./issue";
import { getBot } from "./bot";

checkEnvParams();

const token = process.env.API_TOKEN;

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

