import moment from "moment";
import fetch from "node-fetch";
import { constants } from "./constants";

interface GoscatalogPost {
  id: string;
  topicDate: string;
  title: string;
  description: string;
  date: string;
}

const { checkPeriod } = constants;
const BIG_PERIOD = 1000;


export const getHelpMessage: (debugMode?: boolean) => string = (debugMode = false) => {
  const helpMessage =
    "Бот предназначен для того, чтобы присылать регулярные " +
    "оповещения о новостях госкаталога:\n" +
    "/help - выведет сообщение со списком всех команд\n" +
    "/last - пришлет последнюю опубликованную новость и ссылку на нее\n" +
    "/status - проверит текущий статус подписки\n" +
    "/subscribe - подпишет на ежедневное оповещение об изменениях списка новостей\n" +
    "/unsubscribe - отменит подписку\n" +
    `${
      debugMode
        ? "/debug_issue подготовит и пришлет сообщение одного выпуска рассылки\n"
        : ""
    }` +
    `${debugMode ? "/debug_send отправит выпуск рассылки\n" : ""}` +
    `${
      debugMode ? "/debug_constants отправит набор используемых констант\n" : ""
    }`;

  return helpMessage;
};

const getIntro: (period?: number) => string = (period = checkPeriod) => {
  const defaultMessage: string = `За последние ${period} дней`;
  if (period % 10 > 4) {
    return defaultMessage;
  }
  if (period % 10 === 0) {
    return defaultMessage;
  }
  if (period < 20 && period > 9) {
    return defaultMessage;
  }
  if (period === 1) {
    return `За последний день`;
  }
  if (period % 10 === 1) {
    return `За последний ${period} день`;
  }
  return `За последние ${period} дня`;
};

const getHeaders = async (daysToCheck: number = BIG_PERIOD) => {
  const resp = await fetch(
    "http://goskatalog.ru/muzfo-rest/rest/topics?topicTypeId=2"
  );
  const body = await resp.text();
  const headers: GoscatalogPost[] = JSON.parse(body)
    .sort((a, b) => b.topicDate - a.topicDate)
    .filter((h) => moment() < moment(h.topicDate).add(daysToCheck, "days"))
    .map((h) => ({ ...h, date: moment(h.topicDate).format("MMM Do YY") }));

  return headers;
};

export const getSubscribtionMessage = async (daysToCheck = checkPeriod) => {
  const headers = await getHeaders(daysToCheck);
  if (headers.length > 1) {
    return `${getIntro()} опубликовано несколько записей.\nПерейдите на сайт: http://goskatalog.ru/portal/#/for-museums/news\n`;
  }
  if (headers.length > 0) {
    return (
      `${getIntro()} опубликована одна запись.\n` +
      `Дата: ${headers[0].date}\n` +
      `Ссылка на запись: https://goskatalog.ru/portal/#/for-museums/news?id=${headers[0].id}\n` +
      `\nОтправьте /last, чтобы получить текст сообщения в месенджер\n`
    );
  }

  return `Бот работает. ${getIntro()} новостей нет.`;
};

export const getLastMessage: () => Promise<string> = async () => {
  const headers = await getHeaders();
  const { date, title, description, id } = headers[0];
  const richMessage =
    `<b>${date}</b>\n` +
    `<b>${title}</b>\n\n` +
    description
      .replace(/<br\/>/g, "\n")
      .replace(/<\/[^abius]>|<[^abius]>|<[b-z]\s.*?>|<a\S.*?>/g, "") +
    `\n <a href="https://goskatalog.ru/portal/#/for-museums/news?id=${id}"> Ссылка на запись</a>`;
  return richMessage;
};
