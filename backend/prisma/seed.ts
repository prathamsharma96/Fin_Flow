import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const analystHash = await bcrypt.hash("analyst123", 10);
  const viewerHash = await bcrypt.hash("viewer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@finflow.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@finflow.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@finflow.com" },
    update: {},
    create: {
      name: "Analyst User",
      email: "analyst@finflow.com",
      passwordHash: analystHash,
      role: "ANALYST",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@finflow.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@finflow.com",
      passwordHash: viewerHash,
      role: "VIEWER",
    },
  });

  const categories = [
    "Salary",
    "Freelance",
    "Rent",
    "Utilities",
    "Investment",
    "Food",
    "Transport",
  ];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.4;
    const month = Math.floor(Math.random() * 5);
    records.push({
      userId: i % 3 === 0 ? analyst.id : admin.id,
      amount: parseFloat((Math.random() * 90000 + 5000).toFixed(2)),
      type: isIncome ? "income" : "expense",
      category: categories[Math.floor(Math.random() * categories.length)],
      date: new Date(2026, month, Math.floor(Math.random() * 28) + 1),
      notes: isIncome ? "Credit received" : "Payment made",
    });
  }

  await prisma.financialRecord.createMany({ data: records });

  console.log("Seed complete.");
  console.log("Admin:   admin@finflow.com   / admin123");
  console.log("Analyst: analyst@finflow.com / analyst123");
  console.log("Viewer:  viewer@finflow.com  / viewer123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
