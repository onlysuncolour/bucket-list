import mysql from 'mysql2/promise';

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: true
};

function getConnection() {
  return mysql.createConnection(MYSQL_CONFIG);
}

async function dbExecute(sql: string, values: any[] = [], count = 0) {
  const connection = await getConnection();
  console.log({
    sql, values
  })
  try {
    const result = await connection.execute(sql, values);
    connection.destroy();
    return result;
  } catch (error) {
    console.log({
      sql, values, error
    })
    try {
      connection.destroy();
    } catch (_) {}
    if (count > 3) {
      throw { message: '数据库更新、查询失败，请重试!', stackMessage: sql};
    }
    return dbExecute(sql, values, count + 1);
  }
}

export {
  dbExecute
};
