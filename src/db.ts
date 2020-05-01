import { verbose } from "sqlite3";

interface DbResponse {
  message: string;
  status: 'success' | 'failed';
}

const sqlite3 = verbose();
const DATABASE_PATH = process.env.DB_PATH;

const notifyAdmin = (msg) => console.warn(msg);

const createDatabase = () => {
  notifyAdmin("New database needed, check backup please");
  let db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
      notifyAdmin(err);
      return;
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
    // any because of typing error in library
    (err: any) => {
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

const checkUserExists: (id: number) => Promise<boolean> = async (id) => {
  const p: Promise<boolean> = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.all("SELECT user_id FROM users WHERE user_id=" + id.toString(), [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows.length > 0);
    });
    db.close();
  });

  return p;
}


export const subscribe: (id: number) => Promise<DbResponse> = async (id) => {
  const isUserExists = await checkUserExists(id);

  return new Promise((resolve, reject) => {
    if (isUserExists) {
      resolve({
        message: 'Вы уже подписаны на рассылку',
        status: 'failed'
      })
    }

    const db = new sqlite3.Database(DATABASE_PATH);

    db.run("INSERT INTO users(user_id) VALUES(?)", id, function (err) {
      if (err) {
        reject(err);
      }
      resolve({
        status: 'success',
        message: 'Вы успешно подписались на рассылку'
      });
    });
    db.close();
  });
};

export const unsubscribe: (id: number) => Promise<DbResponse> = async (id: number) => {
  const isUserExists = await checkUserExists(id);

  return new Promise((resolve, reject) => {
    if (!isUserExists) {
      resolve({
        message: 'Вы не подписаны на рассылку',
        status: 'failed'
      })
    }

    const db = new sqlite3.Database(DATABASE_PATH);

    db.run("DELETE FROM users WHERE user_id=" + id.toString(), function (err) {
      if (err) {
        reject(err);
      }
      resolve({
        status: 'success',
        message: 'Вы успешно отписались от рассылки'
      });
    });
    db.close();
  });
};

export const checkSubscribtion: (id: number) => Promise<DbResponse> = async (id) => checkUserExists(id)
  .then(isUserExists => ({
    message: isUserExists ? 'Вы уже подписаны на рассылку' : 'Вы еще не подписаны на рассылку',
    status: 'success'
  }))