import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to sanitize data from the dataset
function sanitizeValue(value) {
  if (value === undefined || value === null) {
    return null;
  }
  
  const cleaned = value.replaceAll('"', "").trim();
  
  // Replace '\N' (OpenFlights null marker) and empty strings with actual null
  if (cleaned === "\\N" || cleaned === "") {
    return null;
  }
  
  return cleaned;
}

// --- AIRPORT IMPORT ---

async function importAirports() {
  const filePath = "./data/airports.dat.txt";
  console.log(`Reading file: ${filePath}`);
  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split("\n");

  const airports = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // OpenFlights airports.dat format:
    // ID,Name,City,Country,IATA,ICAO,Latitude,Longitude,Altitude,Timezone,DST,tzDatabaseTimeZone,...
    const parts = line.split(",");

    const name = sanitizeValue(parts[1]);
    const city = sanitizeValue(parts[2]);
    const country = sanitizeValue(parts[3]);
    const iata = sanitizeValue(parts[4]); // Primary key candidate, must be valid
    const tzDatabase = sanitizeValue(parts[11]); // The IANA Timezone ID

    // Only process entries with a valid IATA code
    if (iata && iata.length === 3) {
      airports.push({ name, city, country, iata, tzDatabase });
    }
  }

  console.log(`Processing ${airports.length} airports...`);

  // --- FASTER BATCH INSERT/UPSERT ---
  // Using a single transaction to upsert multiple records is much faster.
  const batchSize = 1000;
  let processedCount = 0;

  for (let i = 0; i < airports.length; i += batchSize) {
    const batch = airports.slice(i, i + batchSize);
    
    // Create a list of upsert operations
    const upsertPromises = batch.map(airport => 
      prisma.airport.upsert({
        where: { iata: airport.iata },
        update: airport, // Update with new data if it exists
        create: airport, // Create if it doesn't exist
      })
    );
    
    // Execute the batch concurrently
    await prisma.$transaction(upsertPromises);
    processedCount += batch.length;
    console.log(`> Upserted ${processedCount}/${airports.length} airports...`);
  }

  console.log("✅ Airports imported.");
}

// --- AIRLINE IMPORT ---

async function importAirlines() {
  const filePath = "./data/airlines.dat.txt";
  console.log(`Reading file: ${filePath}`);
  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split("\n");

  const airlines = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Format: ID,Name,Alias,IATA,ICAO,Callsign,Country,Active
    const parts = line.split(",");

    const name = sanitizeValue(parts[1]);
    const alias = sanitizeValue(parts[2]);
    // Note: Parts[3] is IATA (often \N), Parts[4] is ICAO (often \N)
    const callsign = sanitizeValue(parts[5]);
    const country = sanitizeValue(parts[6]);
    // Note: To match your original script, IATA/ICAO are skipped, but you might want to add them!

    if (name) {
      airlines.push({ name, alias, callsign, country });
    }
  }

  console.log(`Processing ${airlines.length} airlines...`);
  
  // Use createMany for much faster insertion if you are sure there are no duplicates
  // Note: createMany requires careful handling of duplicates, but is the fastest method.
  await prisma.airline.createMany({
    data: airlines,
    // skipDuplicates: true // Use this if you have a unique constraint on 'name' or another field
  });

  console.log("✅ Airlines imported.");
}

async function main() {
  // Ensure your database schema supports NULL for all optional fields.
  // Example Prisma model for Airport:
  // model Airport {
  //   iata         String @id
  //   name         String?
  //   city         String?
  //   country      String?
  //   tzDatabase   String?
  // }
  
  try {
    await importAirports();
    await importAirlines();
  } catch (error) {
    console.error("❌ Data import failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();