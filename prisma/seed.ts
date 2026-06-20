import "dotenv/config";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  let tenant = await prisma.tenant.findUnique({ where: { id: "test-tenant-1" } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { id: "test-tenant-1", name: "Test İşletmesi" },
    });
    console.log("Tenant oluşturuldu:", tenant);
  } else {
    console.log("Tenant zaten var:", tenant);
  }

  let subscription = await prisma.subscription.findUnique({
    where: { iyzicoSubRef: "mevcut-iyzico-ref" },
  });
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        customerPhone: "+905551234567",
        iyzicoSubRef: "mevcut-iyzico-ref",
        status: "ACTIVE",
      },
    });
    console.log("Subscription oluşturuldu:", subscription);
  } else {
    console.log("Subscription zaten var:", subscription);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
