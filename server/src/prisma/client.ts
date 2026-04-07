import { PrismaClient } from '@prisma/client';

const prismaBase = new PrismaClient();

export const prisma = prismaBase.$extends({
    result: {
        expense: {
            cost: {
                needs: { cost: true },
                compute(data) {
                    return data.cost.toNumber();
                }
            }
        },
        expenseSplit: {
            share: {
                needs: { share: true },
                compute(data) {
                    return data.share.toNumber();
                }
            }
        },
        budget: {
            totalPerPerson: {
                needs: { totalPerPerson: true },
                compute(data) {
                    return data.totalPerPerson?.toNumber() ?? null;
                }
            }
        }
    }
});
