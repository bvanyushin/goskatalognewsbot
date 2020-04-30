import { readUsers } from "./db";
import { getSubscribtionMessage } from "./message";

export const compileIssue = async () => {
  const message = await getSubscribtionMessage();
  const mailList = await readUsers();
  return {
    message,
    mailList,
  };
};
