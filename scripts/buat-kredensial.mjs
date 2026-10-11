import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const password = await rl.question("Password admin (minimal 12 karakter): ");
rl.close();

if (password.length < 12) {
  console.error("\nPassword terlalu pendek. Jalankan ulang dan pakai minimal 12 karakter.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const secret = randomBytes(32).toString("hex");

console.log("\n=== Untuk .env.local (tanda $ sudah di-escape) ===");
console.log("ADMIN_USERNAME=isi-username-pilihanmu");
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}`);
console.log(`SESSION_SECRET=${secret}`);

console.log("\n=== Untuk Vercel (nilai mentah, tanpa escape) ===");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`SESSION_SECRET=${secret}`);