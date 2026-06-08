import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

function ensureLotterySchema(sqlite: Database.Database) {
  const qrCodeColumns = sqlite
    .prepare("PRAGMA table_info(qr_codes)")
    .all()
    .map((column) => (column as { name: string }).name);

  if (!qrCodeColumns.includes("max_scans")) {
    sqlite.exec(
      "ALTER TABLE qr_codes ADD COLUMN max_scans integer NOT NULL DEFAULT 1"
    );
  }

  if (!qrCodeColumns.includes("current_scans")) {
    sqlite.exec(
      "ALTER TABLE qr_codes ADD COLUMN current_scans integer NOT NULL DEFAULT 0"
    );
  }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS scan_records (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      qr_code_id integer NOT NULL,
      name text(100) NOT NULL,
      contact text(200) NOT NULL,
      country text(50),
      survey_answers text,
      team1 text(50),
      team2 text(50),
      team3 text(50),
      team4 text(50),
      scanned_at integer NOT NULL
    )
  `);
}

export function getDb() {
  if (!instance) {
    const dbPath = env.databaseUrl.replace("sqlite:", "");
    console.log("[database] opening sqlite database", dbPath);
    const sqlite = new Database(dbPath);
    ensureLotterySchema(sqlite);
    instance = drizzle(sqlite, { schema: fullSchema });
  }
  return instance;
}
