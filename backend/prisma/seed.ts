import 'dotenv/config'; // 👈 هذا السطر السحري هو ما سيقوم بقراءة ملف .env الخاص بك
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup Prisma 7 Client with PG Adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Start seeding database...');
  
  const usersCount = await prisma.user.count();
  
  if (usersCount === 0) {
    console.log('⚠️ No users found. Creating the initial Admin user...');
    
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@hamachamber.com';
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const admin = await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log(`✅ Admin user created successfully with email: ${admin.email}`);
  } else {
    console.log('✅ Admin user already exists. Skipping seed.');
  }
  
  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Close the connection pool
  });