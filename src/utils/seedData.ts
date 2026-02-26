export const seedData = [
    ...Array.from({ length: 40 }).map((_, i) => ({
        name: `User B1-${i + 1}`,
        email: `b1.user${i + 1}@wissen.com`,
        batch: 1 as 1 | 2,
        role: 'user' as 'user' | 'admin'
    })),
    ...Array.from({ length: 40 }).map((_, i) => ({
        name: `User B2-${i + 1}`,
        email: `b2.user${i + 1}@wissen.com`,
        batch: 2 as 1 | 2,
        role: 'user' as 'user' | 'admin'
    })),
    {
        name: 'Admin User',
        email: 'admin@wissen.com',
        batch: 1 as 1 | 2,
        role: 'admin' as 'user' | 'admin'
    }
];
