import "dotenv/config";
import postgres from "postgres";
import { hash } from "bcryptjs";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL must be set in .env");
    process.exit(1);
  }

  console.log("🌱 Seeding admin account...");

  const sql = postgres(databaseUrl);

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (existing.length > 0) {
      console.log(`⚠️  Admin with email ${email} already exists`);
      return;
    }

    const passwordHash = await hash(password, 12);

    const [admin] = await sql`
      INSERT INTO users (id, email, "passwordHash", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${email}, ${passwordHash}, 'Admin', 'User', 'ADMIN', true, NOW(), NOW())
      RETURNING id, email
    `;

    console.log(`✅ Admin account created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
  } finally {
    await sql.end();
  }
}

seedAdmin().catch((error) => {
  console.error("❌ Error seeding admin:", error);
  process.exit(1);
});
