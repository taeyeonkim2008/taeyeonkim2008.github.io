/**
 * Local destination storage.
 *
 * Only ever touched from the foreground — the background task has no business
 * opening a database on a ten-second budget. Favourites sort ahead of recents
 * so the row on the home screen is stable for a half-asleep thumb: the stop you
 * always use should not move because you tried somewhere else once.
 */

import * as SQLite from 'expo-sqlite';

import type { Destination } from '../core/types';

const DB_NAME = 'stopnap.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS destinations (
          id          TEXT    PRIMARY KEY NOT NULL,
          label       TEXT    NOT NULL,
          subtitle    TEXT,
          latitude    REAL    NOT NULL,
          longitude   REAL    NOT NULL,
          lastUsedAt  INTEGER NOT NULL,
          useCount    INTEGER NOT NULL DEFAULT 0,
          isFavorite  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_destinations_recent
          ON destinations (isFavorite DESC, lastUsedAt DESC);
      `);
      return db;
    })();
  }
  return dbPromise;
}

interface Row {
  id: string;
  label: string;
  subtitle: string | null;
  latitude: number;
  longitude: number;
  lastUsedAt: number;
  useCount: number;
  isFavorite: number;
}

const toDestination = (row: Row): Destination => ({
  id: row.id,
  label: row.label,
  subtitle: row.subtitle ?? undefined,
  latitude: row.latitude,
  longitude: row.longitude,
  lastUsedAt: row.lastUsedAt,
  useCount: row.useCount,
  isFavorite: row.isFavorite === 1,
});

export async function initDb(): Promise<void> {
  await getDb();
}

export async function listDestinations(limit = 12): Promise<Destination[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM destinations
     ORDER BY isFavorite DESC, lastUsedAt DESC
     LIMIT ?`,
    limit,
  );
  return rows.map(toDestination);
}

/** Inserts or updates, preserving useCount and favourite state on conflict. */
export async function saveDestination(dest: Destination): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO destinations
       (id, label, subtitle, latitude, longitude, lastUsedAt, useCount, isFavorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label      = excluded.label,
       subtitle   = excluded.subtitle,
       latitude   = excluded.latitude,
       longitude  = excluded.longitude,
       lastUsedAt = excluded.lastUsedAt`,
    dest.id,
    dest.label,
    dest.subtitle ?? null,
    dest.latitude,
    dest.longitude,
    dest.lastUsedAt,
    dest.useCount,
    dest.isFavorite ? 1 : 0,
  );
}

/** Records that a destination was just armed. */
export async function touchDestination(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE destinations
     SET lastUsedAt = ?, useCount = useCount + 1
     WHERE id = ?`,
    Date.now(),
    id,
  );
}

export async function toggleFavorite(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE destinations SET isFavorite = 1 - isFavorite WHERE id = ?`,
    id,
  );
}

export async function deleteDestination(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM destinations WHERE id = ?`, id);
}

/**
 * A stable id derived from coordinates, so arming the same station twice does
 * not fill the recents row with duplicates. ~11 m of granularity at four
 * decimal places, which is tighter than any two distinct stops.
 */
export function destinationIdFor(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}
