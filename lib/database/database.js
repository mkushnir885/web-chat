// eslint-disable-next-line max-classes-per-file
import promiseMysql from 'mysql2/promise';

const MODE_ROWS = 0;
const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class QueryBuilder {
  constructor(database, table) {
    this.database = database;
    this.table = table;
    this.columns = ['*'];
    this.whereClause = undefined;
    this.whereArgs = [];
    this.valuesArgs = [];
    this.executor = database.execute.bind(database);
  }

  where(conditions) {
    let clause = '';
    const args = [];
    Object.entries(conditions).forEach(([key, value]) => {
      let processedValue = value;
      let condition;
      if (typeof value === 'number') {
        condition = `${key} = ?`;
      } else if (typeof value === 'string') {
        if (value.includes('*') || value.includes('?')) {
          processedValue = value.replace(/\*/g, '%').replace(/\?/g, '_');
          condition = `${key} LIKE ?`;
        } else {
          condition = `${key} = ?`;
        }
      }
      args.push(processedValue);
      clause = clause ? `${clause} AND ${condition}` : condition;
    });
    this.whereClause = clause;
    this.whereArgs = args;
    return this;
  }

  fields(list) {
    this.columns = list;
    return this;
  }

  setValues(list) {
    this.valuesArgs = list;
    return this;
  }

  value(name) {
    this.mode = MODE_VALUE;
    this.valueName = name;
    return this;
  }

  row() {
    this.mode = MODE_ROW;
    return this;
  }

  col(name) {
    this.mode = MODE_COL;
    this.columnName = name;
    return this;
  }

  count() {
    this.mode = MODE_COUNT;
    return this;
  }

  order(name) {
    this.orderBy = name;
    return this;
  }

  commit() {
    this.executor = this.database.safeExecute.bind(this.database);
    return this;
  }
}

class Selector extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
    this.mode = MODE_ROWS;
    this.orderBy = undefined;
  }

  async run() {
    const { table, columns, whereArgs } = this;
    const { whereClause, orderBy } = this;
    const fields = columns.join(', ');
    let sql = `SELECT ${fields} FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    sql += ';';
    const res = await this.executor(sql, whereArgs);
    const modeHandlers = new Map([
      [
        MODE_VALUE,
        (result) => {
          const [row] = result;
          return row[this.valueName];
        },
      ],
      [
        MODE_ROW,
        (result) => result[0],
      ],
      [
        MODE_COL,
        (result) => result.map((row) => row[this.columnName]),
      ],
      [
        MODE_COUNT,
        (result) => result.length,
      ],
    ]);
    const handler = modeHandlers.get(this.mode);
    if (handler) {
      return handler(res);
    }
    return res;
  }
}

class Creator extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
  }

  async run() {
    const { table, columns, valuesArgs } = this;
    const fields = columns.join(', ');
    const placeholders = valuesArgs.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table}(${fields}) VALUES(${placeholders});`;
    return this.executor(sql, valuesArgs);
  }
}

class Updater extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
  }

  async run() {
    const { table, columns } = this;
    const { whereClause, whereArgs, valuesArgs } = this;
    const fields = columns.map((column) => `${column} = ?`).join(' ,');
    let sql = `UPDATE ${table} SET ${fields}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    sql += ';';
    return this.executor(sql, [...valuesArgs, ...whereArgs]);
  }
}

class Replacer extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
  }

  async run() {
    const { table, columns, valuesArgs } = this;
    const fields = columns.join(', ');
    const placeholders = valuesArgs.map(() => '?').join(', ');
    const sql = `REPLACE INTO ${table}(${fields}) VALUES(${placeholders});`;
    return this.executor(sql, valuesArgs);
  }
}

class Remover extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
  }

  async run() {
    const { table } = this;
    const { whereClause, whereArgs } = this;
    let sql = `DELETE FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    sql += ';';
    return this.executor(sql, whereArgs);
  }
}

class Database {
  constructor(config, logger) {
    this.pool = promiseMysql.createPool(config);
    this.logger = logger;
    this.logger.info('The database is running');
  }

  async execute(sql, values) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const [res] = await connection.execute(sql, values);
      return res;
    } catch (err) {
      const { message } = err.message;
      this.logger.error(`cannot execute SQL-script (${message})`);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  }

  async safeExecute(sql, values) {
    let connection = null;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();
      const [res] = await connection.execute(sql, values);
      await connection.commit();
      return res;
    } catch (err) {
      const { message } = err;
      this.logger.error(`cannot execute SQL-script (${message})`);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  }

  select(table) {
    return new Selector(this, table);
  }

  add(table) {
    return new Creator(this, table);
  }

  update(table) {
    return new Updater(this, table);
  }

  replace(table) {
    return new Replacer(this, table);
  }

  delete(table) {
    return new Remover(this, table);
  }

  async close() {
    await this.pool.end();
    this.logger.info('The database is closed');
    this.logger.close();
  }
}

export default (config, logger) => new Database(config, logger);
