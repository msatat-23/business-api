import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, type Prisma } from '@prisma/client';
import { Role } from '../../common/enums/role.enum';

dotenv.config();

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, 'data');

function readJson<T = any>(fileName: string): T {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function seedPage(slug: string, content: Prisma.InputJsonValue) {
  const page = await prisma.page.upsert({
    where: { slug },
    create: {
      slug,
      content,
      updatedByEmail: 'seed-script',
    },
    update: {
      content,
      updatedByEmail: 'seed-script',
    },
  });

  return page;
}

async function seedPages() {
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

  const homeContent: Prisma.InputJsonObject = {
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
  };

  await seedPage('home', homeContent);

  if (site?.contactPage) {
    await seedPage('contact', {
      contactPage: site.contactPage,
    });
  }

  console.log('✅ Page content seeded from /database/seeds/data/*.json');
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@business-dev.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const fullName = process.env.SEED_ADMIN_FULLNAME || 'Super Admin';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`ℹ️  Admin user already exists (${email}) - skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Bootstrap admin created: ${email} (change the password after first login!)`);
}

async function run() {
  console.log('📡 Connected to Postgres for seeding...');

  try {
    await seedPages();
    await seedAdmin();
    console.log('🎉 Seeding complete.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
