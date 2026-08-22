import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Alex Morgan (Employee)
  const alexPassword = await bcrypt.hash('password123', 10);
  
  const userAlex = await prisma.user.upsert({
    where: { email: 'alex.morgan@dayflow.hr' },
    update: {},
    create: {
      employeeId: 'EMP001',
      email: 'alex.morgan@dayflow.hr',
      password: alexPassword,
      role: 'EMPLOYEE',
      emailVerified: true,
      employee: {
        create: {
          firstName: 'Alex',
          lastName: 'Morgan',
          phone: '+1 (555) 234-5678',
          department: 'Design & Product',
          designation: 'Senior UX Designer',
        }
      }
    }
  });
  console.log(`Created user: ${userAlex.email}`);

  // 2. Create Courtney Henry (Admin/HR)
  const courtneyPassword = await bcrypt.hash('demo1234', 10);
  
  const userCourtney = await prisma.user.upsert({
    where: { email: 'courtney.h@dayflow.hr' },
    update: {},
    create: {
      employeeId: 'EMP002',
      email: 'courtney.h@dayflow.hr',
      password: courtneyPassword,
      role: 'ADMIN',
      emailVerified: true,
      employee: {
        create: {
          firstName: 'Courtney',
          lastName: 'Henry',
          phone: '+1 (555) 345-6789',
          department: 'Human Resources',
          designation: 'HR Specialist',
        }
      }
    }
  });
  console.log(`Created user: ${userCourtney.email}`);

  // 3. Add Attendance Records for Alex
  const today = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const checkIn = new Date(d);
    checkIn.setHours(9, Math.floor(Math.random() * 30), 0, 0);
    
    const checkOut = new Date(d);
    checkOut.setHours(17, 30 + Math.floor(Math.random() * 30), 0, 0);

    await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: userAlex.id,
          date: d
        }
      },
      update: {},
      create: {
        userId: userAlex.id,
        date: d,
        checkIn: checkIn,
        checkOut: checkOut,
        checkInIp: '192.168.1.100',
        checkOutIp: '192.168.1.100',
        status: 'PRESENT'
      }
    });
  }
  console.log('Created dummy attendance records for Alex');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
