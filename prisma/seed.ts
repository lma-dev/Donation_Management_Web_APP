import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Deterministic seed data per year (avoids random values changing on re-run)
const YEARLY_SEED_DATA: Record<
  number,
  { collected: number; donated: number }[]
> = {
  2023: [
    { collected: 2500000, donated: 2100000 },
    { collected: 1800000, donated: 1500000 },
    { collected: 3200000, donated: 2800000 },
    { collected: 2700000, donated: 2300000 },
    { collected: 1900000, donated: 1600000 },
    { collected: 4100000, donated: 3700000 },
    { collected: 3500000, donated: 3000000 },
    { collected: 2200000, donated: 1900000 },
    { collected: 2800000, donated: 2400000 },
    { collected: 3600000, donated: 3100000 },
    { collected: 4200000, donated: 3800000 },
    { collected: 5000000, donated: 4500000 },
  ],
  2024: [
    { collected: 3000000, donated: 2600000 },
    { collected: 2200000, donated: 1800000 },
    { collected: 3800000, donated: 3300000 },
    { collected: 3100000, donated: 2700000 },
    { collected: 2500000, donated: 2100000 },
    { collected: 4600000, donated: 4100000 },
    { collected: 4000000, donated: 3500000 },
    { collected: 2800000, donated: 2400000 },
    { collected: 3300000, donated: 2900000 },
    { collected: 4100000, donated: 3600000 },
    { collected: 4800000, donated: 4300000 },
    { collected: 5500000, donated: 5000000 },
  ],
  2025: [
    { collected: 3500000, donated: 3000000 },
    { collected: 2700000, donated: 2300000 },
    { collected: 4200000, donated: 3700000 },
    { collected: 3600000, donated: 3100000 },
    { collected: 2900000, donated: 2500000 },
    { collected: 5100000, donated: 4500000 },
    { collected: 4500000, donated: 3900000 },
    { collected: 3200000, donated: 2800000 },
    { collected: 3800000, donated: 3300000 },
    { collected: 4600000, donated: 4100000 },
    { collected: 5300000, donated: 4700000 },
    { collected: 6000000, donated: 5400000 },
  ],
};

async function seedYearlySummaries() {
  for (const [yearStr, monthlyData] of Object.entries(YEARLY_SEED_DATA)) {
    const fiscalYear = Number(yearStr);

    const totalCollected = monthlyData.reduce(
      (sum, m) => sum + m.collected,
      0,
    );
    const totalDonated = monthlyData.reduce((sum, m) => sum + m.donated, 0);

    await prisma.yearlySummary.upsert({
      where: { fiscalYear },
      update: {
        totalCollected,
        totalDonated,
      },
      create: {
        fiscalYear,
        totalCollected,
        totalDonated,
        monthlyRecords: {
          create: monthlyData.map((m, i) => ({
            month: MONTHS[i],
            collectedAmount: m.collected,
            donatedAmount: m.donated,
          })),
        },
      },
    });

    console.log(`Seeded yearly summary: FY ${fiscalYear}`);
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@slr.org" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@slr.org",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seeded admin user:", admin.email);

  await seedYearlySummaries();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
