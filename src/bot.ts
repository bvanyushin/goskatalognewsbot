import TelegramBot from "node-telegram-bot-api";
import { constants } from "./constants";
import { saveUser } from "./db";
import { getLastMessage, getSubscribtionMessage, getHelpMessage } from "./message"

export const getBot: (token: string, debugMode?: boolean) => TelegramBot = (
  token: string,
  debugMode = false
) => {
  const bot = new TelegramBot(token, {
    polling: true,
  });

  bot.onText(/\/start/, function (msg) {
    const botMessage = "Попробуйте /help";
    bot.sendMessage(msg.from.id, botMessage);
  });

  bot.onText(/\/unsubscribe/, function (msg) {
    // unsubscribe(msg.from.id);
    bot.sendMessage(msg.from.id, "Сорян, еще не работает");
  });

  bot.onText(/\/help/, function (msg) {
    bot.sendMessage(msg.from.id, getHelpMessage(debugMode));
  });

  bot.onText(/\/subscribe/, async function (msg) {
    await saveUser(msg.from.id.toString());
    bot.sendMessage(msg.from.id, "Вы успешно подписались");
  });

  bot.onText(/\/last/, async function (msg) {
    const botMessage = await getLastMessage();
    bot.sendMessage(msg.from.id, botMessage, { parse_mode: "HTML" });
  });

  if (debugMode) {
    bot.onText(/\/debug_issue/, async function (msg) {
      const botMessage = await getSubscribtionMessage();
      bot.sendMessage(msg.from.id, botMessage, { parse_mode: "HTML" });
    });

    bot.onText(/\/debug_constants/, async function (msg) {
      bot.sendMessage(msg.from.id, JSON.stringify(constants));
    });
  }

  return bot;
};
