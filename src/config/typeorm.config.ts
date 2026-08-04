import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { HomePage } from '../modules/home/entities/home-page.entity';
import { Contact } from '../modules/contact/entities/contact.entity';

dotenv.config();

/**
 * Shared DataSource options used both by the running Nest application
 * (via TypeOrmModule.forRootAsync) and by the TypeORM CLI for generating
 * and running migrations (`npm run migration:generate` / `migration:run`).
 */
export const typeOrmDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'marketplace_db',
  entities: [User, HomePage, Contact],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

// Default export required by the TypeORM CLI (`-d src/config/typeorm.config.ts`)
export default new DataSource(typeOrmDataSourceOptions);
