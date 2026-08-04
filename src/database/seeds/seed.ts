import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from '../../config/typeorm.config';
import { HomePage } from '../../modules/home/entities/home-page.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

dotenv.config();

const DATA_DIR = path.join(__dirname, 'data');

function readJson<T = any>(fileName: string): T {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function seedHomePage(dataSource: DataSource) {
  const repo = dataSource.getRepository(HomePage);

  const site = readJson('site.json');
  const heroSection = readJson('heroSection.json');
  const heroDashboard = readJson('heroDashboard.json');
  const chartData = readJson('chartData.json');
  const navigation = readJson('navigation.json');
  const services = readJson('services.json');
  const capabilities = readJson('capabilities.json');
  const methodology = readJson('methodology.json');
  const roadmap = readJson('roadmap.json');
  const portfolio = readJson('portfolio.json');
  const sectorPlaybooks = readJson('sectorPlaybooks.json');

  let home = await repo.findOne({ where: { id: 1 } });
  if (!home) {
    home = repo.create({ id: 1 });
  }

  Object.assign(home, {
    site,
    heroSection,
    heroDashboard,
    chartData,
    navigation,
    services,
    capabilities,
    methodology,
    roadmap,
    portfolio,
    sectorPlaybooks,
    updatedByEmail: 'seed-script',
  });

  await repo.save(home);
  console.log('✅ Home page content seeded from /database/seeds/data/*.json');
}

async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@business-dev.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const fullName = process.env.SEED_ADMIN_FULLNAME || 'Super Admin';

  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin user already exists (${email}) - skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = repo.create({
    fullName,
    email,
    password: hashedPassword,
    role: Role.ADMIN,
    isActive: true,
  });

  await repo.save(admin);
  console.log(`✅ Bootstrap admin created: ${email} (change the password after first login!)`);
}

async function run() {
  const dataSource = new DataSource(typeOrmDataSourceOptions);
  await dataSource.initialize();
  console.log('📡 Connected to Postgres for seeding...');

  try {
    await seedHomePage(dataSource);
    await seedAdmin(dataSource);
    console.log('🎉 Seeding complete.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

run();
