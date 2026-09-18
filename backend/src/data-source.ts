import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Bill } from './entities/Bill';
import { BillItem } from './entities/BillItem';
import { Customer } from './entities/Customer';
import { MenuItem } from './entities/MenuItem';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const useSsl = process.env.DB_SSL === 'true' || hasDatabaseUrl || isProduction;

// Strip sslmode query parameter if present so pg driver uses our custom ssl config { rejectUnauthorized: false }
const rawDatabaseUrl = process.env.DATABASE_URL || '';
const cleanDatabaseUrl = rawDatabaseUrl
  .replace(/[?&]sslmode=[^&]*/g, '')
  .replace(/\?&/, '?')
  .replace(/[?&]$/, '');

export const AppDataSource = new DataSource(
  hasDatabaseUrl
    ? {
        type: 'postgres',
        url: cleanDatabaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
        synchronize: true, // auto-creates/updates tables
        logging: false,
        entities: [Bill, BillItem, Customer, MenuItem],
        subscribers: [],
        migrations: [],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'avadhut_bhel',
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        extra: useSsl
          ? {
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : undefined,
        synchronize: true,
        logging: false,
        entities: [Bill, BillItem, Customer, MenuItem],
        subscribers: [],
        migrations: [],
      }
);

let dbInitPromise: Promise<DataSource> | null = null;

export async function ensureDatabase(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  if (!dbInitPromise) {
    dbInitPromise = AppDataSource.initialize()
      .then(async (ds) => {
        console.log('✅ PostgreSQL connected via TypeORM');
        return ds;
      })
      .catch((err) => {
        dbInitPromise = null;
        console.error('❌ Failed to connect to database:', err);
        throw err;
      });
  }
  return dbInitPromise;
}
