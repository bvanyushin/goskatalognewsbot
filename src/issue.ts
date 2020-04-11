import { readUsers, removeUser, saveUser } from "./db";
import { getSubscribtionMessage } from "./message";

export const compileIssue = async () => {
  const message = await getSubscribtionMessage();
  console.log(message)
  const mailList = await readUsers();
  return {
    message,
    mailList
  }
}