import TelegramBot from "node-telegram-bot-api";
import { constants } from "./constants";
import { subscribe, unsubscribe, checkSubscribtion } from "./db";
import { getLastMessage, getSubscribtionMessage } from "./message"

const debugMode = process.env.ENVIRONMENT === "DEV";

type TelegramMessageSender = (chatId: number | string, text: string, options?: TelegramBot.SendMessageOptions) => Promise<TelegramBot.Message>;
interface BotAnswer {
  menuPriority: number,
  trigger: string;
  message: string;
  handlerGenerator: (sendMessage: TelegramMessageSender) => (msg: TelegramBot.Message) => void;
  debug?: boolean;
}

const botAnswers: BotAnswer[] = [
  {
    menuPriority: -1,
    trigger: '/start',
    debug: false,
    message: '',
    handlerGenerator: (sendMessage) => (msg: TelegramBot.Message) => {
      sendMessage(msg.from.id, "Попробуйте /help")
    }
  },
  {
    menuPriority: 0,
    trigger: '/help',
    debug: false,
    message: 'выведет сообщение со списком всех команд',
    handlerGenerator: (sendMessage) => (msg: TelegramBot.Message) => {
      sendMessage(msg.from.id, getHelpMessage());
    }
  },
  {
    menuPriority: 200,
    trigger: '/subscribe',
    debug: false,
    message: 'подпишет на ежедневное оповещение об изменениях списка новостей',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      const result = await subscribe(msg.from.id);
      sendMessage(msg.from.id, result.message)
    }
  },
  {
    menuPriority: 300,
    trigger: '/unsubscribe',
    debug: false,
    message: 'отменит подписку',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      const result = await unsubscribe(msg.from.id);
      sendMessage(msg.from.id, result.message)
    }
  },
  {
    menuPriority: 400,
    trigger: '/last',
    debug: false,
    message: 'пришлет последнюю опубликованную новость и ссылку на нее',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      const botMessage = await getLastMessage();
      sendMessage(msg.from.id, botMessage, { parse_mode: "HTML" });
    }
  },
  {
    menuPriority: 100,
    trigger: '/status',
    debug: false,
    message: 'проверит текущий статус подписки',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      const result = await checkSubscribtion(msg.from.id);
      sendMessage(msg.from.id, result.message);
    }
  },
  {
    menuPriority: 10000,
    trigger: '/debug_issue',
    debug: true,
    message: 'подготовит и пришлет сообщение одного выпуска рассылки',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      const botMessage = await getSubscribtionMessage();
      sendMessage(msg.from.id, botMessage, { parse_mode: "HTML" });
    }
  },
  {
    menuPriority: 10100,
    trigger: '/debug_constants',
    debug: true,
    message: 'отправит набор используемых констант',
    handlerGenerator: (sendMessage) => async (msg: TelegramBot.Message) => {
      sendMessage(msg.from.id, JSON.stringify(constants));
    }
  },
].filter(({debug}) => debugMode || !debug);

const getHelpMessage: () => string = () => {
  const message = "Бот предназначен для того, чтобы присылать регулярные " +
    "оповещения о новостях госкаталога:\n" + botAnswers
      .sort(({ menuPriority: a }, { menuPriority: b }) => a - b)
      .filter(({ menuPriority }) => menuPriority >= 0)
      .filter(({ message }) => message !== '')
      .map(({ trigger, message }) => `${trigger} - ${message}`)
      .join("\n")
  return message;
}

export const getBot: (token: string) => TelegramBot = (
  token: string,
) => {
  const bot = new TelegramBot(token, {
    polling: true,
  });

  botAnswers.forEach(answerTemplate => {
    bot.onText(RegExp(answerTemplate.trigger), answerTemplate.handlerGenerator(bot.sendMessage.bind(bot)))
  })

  return bot;
};
