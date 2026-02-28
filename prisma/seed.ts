import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  {
    name: "System Admin",
    email: "systemadmin@slr.com",
    role: "SYSTEM_ADMIN" as const,
  },
  { name: "Admin", email: "admin@slr.com", role: "ADMIN" as const },
  { name: "User", email: "user@slr.com", role: "USER" as const },
];

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123$", 12);

  for (const user of SEED_USERS) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    console.log(`Seeded ${user.role}: ${result.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
