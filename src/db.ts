import { verbose } from "sqlite3";
const sqlite3 = verbose();
const DATABASE_PATH = process.env.dbpath || "./db/botdb.db";
const notifyAdmin = (msg) => console.error(msg)

const createDatabase = () => {
  notifyAdmin('New database needed, check backup please');
  let db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
      notifyAdmin(err);
    }
    db.run("CREATE TABLE users(user_id text)");
    console.log(`Database created on path ${DATABASE_PATH}.`);
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
};

export const initDatabase: () => void = async () => {
  console.log(`Trying to connect to database on path ${DATABASE_PATH}.`);
  const db = new sqlite3.Database(
    DATABASE_PATH,
    sqlite3.OPEN_READONLY,
    (err: any) => {
      // any because of typing error in library
      if (err) {
        if (err.code === "SQLITE_CANTOPEN") {
          console.log(`Unable to find database on path ${DATABASE_PATH}.`);
          console.log(`Trying to create database on path ${DATABASE_PATH}.`);
          createDatabase();
          return;
        }
        console.error(err.name);
        return;
      }
      console.log("Database is ok.");
    }
  );
  await db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
};

export const readUsers: () => Promise<string[]> = async () => {
  const p: Promise<string[]> = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.all("SELECT user_id FROM users", [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows.map(({ user_id }) => user_id));
    });
    db.close();
  });

  return p;
};

export const saveUser: (id: string) => Promise<void> = async (id) => {
  const p: Promise<string[]> = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_PATH);

    db.run("INSERT INTO users(user_id) VALUES(?)", id, function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
    db.close();
  });
};

export const removeUser: (id: string) => void = (id: string) => {
  console.error("not implemented yet");
};
