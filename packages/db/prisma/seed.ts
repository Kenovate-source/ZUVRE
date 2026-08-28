import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Plan names deliberately avoid Free/Basic/Pro/Enterprise (spec §10).
 * Rationale for each name lives in docs/18-monetization.md.
 */
const PLANS = [
  {
    id: "spark",
    name: "Spark",
    description: "Everything you need to start creating with ZUVRE, at no cost.",
    priceMonthlyMinorUnits: 0,
    entitlements: {
      "ai.chat": { quota: 100, unit: "messages", period: "day" },
    },
    sortOrder: 0,
  },
  {
    id: "ember",
    name: "Ember",
    description: "For people building something regularly — more capability headroom, priority queueing.",
    priceMonthlyMinorUnits: 900,
    entitlements: {
      "ai.chat": { quota: 1000, unit: "messages", period: "day" },
    },
    sortOrder: 1,
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "For teams and serious creators — full capability access, collaboration, higher quotas.",
    priceMonthlyMinorUnits: 2900,
    entitlements: {
      "ai.chat": { quota: 10000, unit: "messages", period: "day" },
    },
    sortOrder: 2,
  },
  {
    id: "orbit",
    name: "Orbit",
    description: "For organizations that need custom limits, dedicated support, and operational controls.",
    priceMonthlyMinorUnits: 0, // custom / contact — see docs/18-monetization.md
    entitlements: {},
    sortOrder: 3,
  },
] as const;

const PLATFORM_ROLES = [
  { key: "platform_owner", label: "Platform Owner", permissions: ["owner.*"], maxOccupants: 1 },
  { key: "ops_on_call", label: "Operations (On-call)", permissions: ["owner.ecosystem.view", "owner.incidents.*"], maxOccupants: null },
];

async function main() {
  for (const plan of PLANS) {
    await db.plan.upsert({
      where: { id: plan.id },
      create: plan as any,
      update: plan as any,
    });
  }

  for (const role of PLATFORM_ROLES) {
    await db.role.upsert({
      where: { workspaceId_key: { workspaceId: null as any, key: role.key } },
      create: { workspaceId: null, key: role.key, label: role.label, permissions: role.permissions, maxOccupants: role.maxOccupants ?? undefined },
      update: { label: role.label, permissions: role.permissions, maxOccupants: role.maxOccupants ?? undefined },
    });
  }

  console.log(`Seeded ${PLANS.length} plans and ${PLATFORM_ROLES.length} platform roles.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
