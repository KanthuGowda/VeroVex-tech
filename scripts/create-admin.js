require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@verovex.com";
  const password = "Admin@12345";

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("An account with this email already exists.");

    if (existingUser.role === "ADMIN") {
      console.log("This account is already an ADMIN.");
    } else {
      console.log(
        "This email belongs to a non-admin account."
      );
    }

    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const admin = await prisma.user.create({
    data: {
      name: "VeroVex Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("================================");
  console.log("ADMIN ACCOUNT CREATED");
  console.log("================================");
  console.log("Email:", admin.email);
  console.log("Password:", password);
  console.log("Role:", admin.role);
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("Error creating admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });