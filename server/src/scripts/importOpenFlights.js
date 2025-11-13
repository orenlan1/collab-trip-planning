import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importAirports() {
  const file = fs.readFileSync("./data/airports.dat.txt", "utf8");
  const lines = file.split("\n");

  const airports = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // OpenFlights airports.dat format:
    // ID,Name,City,Country,IATA,ICAO,Latitude,Longitude,Altitude,Timezone,DST,tzDatabaseTimeZone,...
    const parts = line.split(",");

    const name = parts[1]?.replaceAll('"', "");
    const city = parts[2]?.replaceAll('"', "");
    const country = parts[3]?.replaceAll('"', "");
    const iata = parts[4]?.replaceAll('"', "");
    const tzDatabase = parts[11]?.replaceAll('"', "");

    if (iata) {
      airports.push({ name, city, country, iata, tzDatabase });
    }
  }

  console.log(`Saving ${airports.length} airports...`);
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iata: airport.iata },
      update: {},
      create: airport,
    });
  }

  console.log("✅ Airports imported.");
}

async function importAirlines() {
  const file = fs.readFileSync("./data/airlines.dat.txt", "utf8");
  const lines = file.split("\n");

  const airlines = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Format: ID,Name,Alias,IATA,ICAO,Callsign,Country,Active
    const parts = line.split(",");

    const name = parts[1]?.replaceAll('"', "");
    const alias = parts[2]?.replaceAll('"', "");
    const callsign = parts[5]?.replaceAll('"', "");
    const country = parts[6]?.replaceAll('"', "");

    if (name) {
      airlines.push({ name, alias, callsign, country });
    }
  }

  console.log(`Saving ${airlines.length} airlines...`);
  for (const airline of airlines) {
    await prisma.airline.create({ data: airline });
  }

  console.log("✅ Airlines imported.");
}

async function main() {
  await importAirports();
  await importAirlines();
  await prisma.$disconnect();
}

main();
