const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSeed() {
    console.log("Starting seed process for 80 employees + 1 admin...");

    const users = [
        {
            name: 'Admin User',
            email: 'admin@wissen.com',
            password: 'password123',
            batch: 1,
            role: 'admin'
        }
    ];

    // Batch 1: 40
    for (let i = 1; i <= 40; i++) {
        users.push({
            name: `User B1-${i}`,
            email: `b1.user${i}@wissen.com`,
            password: 'password123',
            batch: 1,
            role: 'user'
        });
    }

    // Batch 2: 40
    for (let i = 1; i <= 40; i++) {
        users.push({
            name: `User B2-${i}`,
            email: `b2.user${i}@wissen.com`,
            password: 'password123',
            batch: 2,
            role: 'user'
        });
    }

    for (const user of users) {
        console.log(`Creating auth user: ${user.email}`);

        // Create in Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true
        });

        if (authError) {
            console.error(`Error creating ${user.email} auth:`, authError.message);
            continue;
        }

        // Insert into public.employees
        const { error: dbError } = await supabase
            .from('employees')
            .insert({
                id: authData.user.id,
                name: user.name,
                email: user.email,
                batch: user.batch,
                role: user.role
            });

        if (dbError) {
            console.error(`Error inserting ${user.email} employee:`, dbError.message);
        } else {
            console.log(`Successfully created ${user.email}`);
        }
    }

    console.log("Seed process complete.");
}

runSeed();
