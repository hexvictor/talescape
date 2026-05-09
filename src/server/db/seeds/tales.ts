import { seedTales } from "./tale-reader/seedTales";

async function main() {
	await seedTales();
	process.exit(0);
}

main().catch((err) => {
	console.error("❌ Failed to seed tales", err);
	process.exit(1);
});
