/**
 * Crée ou met à jour un administrateur directement dans MySQL.
 * Usage : npm run admin:create -- "email@exemple.com" "mot de passe de 12+ caractères" "Nom affiché"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [emailArg, password, nameArg] = process.argv.slice(2);
  const email = (emailArg ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    console.error('Usage : npm run admin:create -- "email" "mot de passe (12 caractères minimum)" "Nom"');
    process.exit(1);
  }
  const name = (nameArg ?? "Administrateur").trim().slice(0, 100);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name, active: true },
    create: { email, name, passwordHash },
  });
  console.log(`Administrateur prêt : ${user.email} (id ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
