import { ResultSetHeader } from 'mysql2/promise';
import { dbExecute } from './index.service';

type TDbWhere = {
  key: string
  value: any
  type: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'like' | 'in' | 'between' | 'LIKE' | 'IN' | 'BETWEEN'
}

type TDbJoinField = {
  field: string
  as?: string
}

type TDbJoin = {
  table: string
  on: {
    leftKey: string
    rightKey: string
  }[]
  fields?: (string | TDbJoinField)[]  // 支持字符串或带别名的字段对象
}

export async function handleSelectData({
  table,
  fields,
  where,
  orderBy,
  limit,
  offset,
  leftJoin,
}: {
  table: string
  fields?: string[]
  where?: TDbWhere[]
  orderBy?: {
    key: string
    type: 'asc' | 'desc'
  },
  limit?: number
  offset?: number
  leftJoin?: TDbJoin[]
}) {
  const {
    sql: whereSql,
    values: whereValues,
  } = makeWhereClause(where);

  // 处理字段，添加表名前缀以避免字段名冲突
  const selectedFields = fields?.map(field => {
    return field.includes('.') ? field : `${table}.${field}`
  }) || [`${table}.*`];

  // 添加 join 表的字段
  if (leftJoin) {
    leftJoin.forEach(join => {
      if (join.fields) {
        selectedFields.push(...join.fields.map(field => {
          if (typeof field === 'string') {
            return field.includes('.') ? field : `${join.table}.${field}`;
          } else {
            // 处理带 as 的字段
            const fieldWithTable = field.field.includes('.') 
              ? field.field 
              : `${join.table}.${field.field}`;
            return field.as 
              ? `${fieldWithTable} AS ${field.as}`
              : fieldWithTable;
          }
        }));
      } else {
        selectedFields.push(`${join.table}.*`);
      }
    });
  }

  let sql = `SELECT ${selectedFields.join(',')} FROM ${table}`;
  
  // 处理 LEFT JOIN
  if (leftJoin) {
    leftJoin.forEach(join => {
      sql += ` LEFT JOIN ${join.table} ON ${join.on.map(condition => 
        `${table}.${condition.leftKey} = ${join.table}.${condition.rightKey}`
      ).join(' AND ')}`;
    });
  }

  const values: any[] = [];
  if (whereSql) {
    sql += ` WHERE ${whereSql}`;
    values.push(...whereValues);
  }
  if (orderBy) {
    sql += ` ORDER BY ${orderBy.key} ${orderBy.type}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  if (offset) {
    sql += ` OFFSET ${offset}`;
  }
  sql += ';';
  const result = (await dbExecute(sql, values))?.[0] as any[];
  return result;
}

export async function handleInsertData({
  table,
  fields,
  data,
}: {
  table: string,
  fields: string[],
  data: { [key: string]: any }[]
}) {
  const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES ${data.map(() => `(${fields.map(() => '?').join(',')})`).join(',')}`;
  const values = data.map((item) => fields.map((field) => item[field]));
  const result = (await dbExecute(sql, values))?.[0] as ResultSetHeader;
  return result;
}

export async function handleUpdateData({
  table,
  fields,
  data,
  where,
  limit,
}: {
  table: string,
  fields: string[],
  data: { [key: string]: any }[]
  where: TDbWhere[]
  limit?: number,
}) {

  const {
    sql: whereSql,
    values: whereValues,
  } = makeWhereClause(where);
  
  let sql = `UPDATE ${table} SET ${fields.map((field) => `${field} = ?`).join(',')} WHERE ${whereSql}`;
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  sql += ';';
  const values = [...data.map((item) => fields.map((field) => item[field])), ...whereValues];
  const result = (await dbExecute(sql, values))?.[0] as ResultSetHeader;
  return result;
}

export async function handleCreateOrUpdateData({
  table,
  fields,
  data,
  uniqueKeys,
}: {
  table: string,
  fields: string[],
  data: { [key: string]: any }[]
  uniqueKeys: string[]
}) {
  const sql = `INSERT INTO ${table}
    (${fields.join(',')})
    VALUES ${data.map(() => `(${fields.map(() => '?').join(',')})`).join(',')}
    ON DUPLICATE KEY UPDATE
    ${fields.filter(field => !uniqueKeys.includes(field)).map(field => `${field} = VALUES(${field})`).join(',')}
    ;`;
  const values = data.map((item) => fields.map((field) => item[field]));
  const result = (await dbExecute(sql, values))?.[0] as ResultSetHeader;
  return result;

}

export async function handleDeleteData({
  table,
  where,
  limit,
}: {
  table: string,
  where: TDbWhere[]
  limit?: number,
}) {
  const {
    sql: whereSql,
    values: whereValues,
  } = makeWhereClause(where);
  let sql = `DELETE FROM ${table} WHERE ${whereSql}`;
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  sql += ';';
  const values = [...whereValues];
  const result = (await dbExecute(sql, values))?.[0] as ResultSetHeader;
  return result;
}

function makeWhereClause(where?: TDbWhere[]) {
  if (!where) {
    return { sql: '', values: [] };
  }
  const sql = where.map((item) => {
    if (item.type === 'between') {
      return `${item.key} BETWEEN ? AND ?`
    }
    return `${item.key} ${item.type} ?`
  }).join(' AND '),
  values: any[] = [];

  where.forEach(item => {
    if (item.type === 'between') {
      values.push(item.value[0], item.value[1])
    } else {
      values.push(item.value)
    }
  })
  return { sql, values }
}
