#!/bin/env node

import mysql from 'mysql2/promise'
import { config } from './config.mjs'
import path from 'path'

const scriptName = path.basename(process.argv[1])

if (process.argv.length < 3) {
  console.error("The name of the mailing list should be provided as argument")
  process.exit(1)
}

const list = process.argv[2]
console.log(`Processing list ${list}...`)

try {
  const connection = await mysql.createConnection(
    `mysql://${config.dbUser}:${config.dbPass}@${config.dbHost}:3306/${config.dbName}`
  )

  // CAREFUL THAT WE DON'T CHECK IF THE LIST EXISTS AT ALL

  let prefIds = []
  let addressIds = []
  try {
    const sql = 'SELECT address_id, preferences_id FROM member WHERE list_id = ?';
    const [rows] = await connection.execute(sql, [list])
    for (const m of rows) {
      prefIds.push(m.preferences_id)
      addressIds.push(m.address_id)
    }
  } catch (err) {
    console.log(`${scriptName} - Could not fetch list members: `, err)
    process.exit(3)
  }

  // Get the preferences ids from the addresses:
  const prefSql = "SELECT preferences_id FROM address where id = ? LIMIT 1"
  for (const a of addressIds) {
    const [rows] = await connection.execute(prefSql, [a])
    if (rows.length > 0) {
      prefIds.push(rows[0].preferences_id)
    }
  }

  // Applying the change - Only target preferences that have these 
  // params set to NULL (default)
  const updateSql = `UPDATE preferences SET receive_list_copy = 0, 
    receive_own_postings = 0 WHERE id = ? AND receive_list_copy IS NULL 
    AND receive_own_postings IS NULL`
  for (const p of prefIds) {
    const [result] = await connection.execute(updateSql, [p])
    result.affectedRows && console.log(`Updated preferences for preferences_id ${p}`)
  }

  console.log("Done")

  process.exit(0)
} catch (err) {
  console.log(`${scriptName} - Database error: `, err)
  process.exit(2)
}
