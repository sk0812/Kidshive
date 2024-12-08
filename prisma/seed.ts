const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Required environment variables are missing');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'siddhanth0812@gmail.com';
  const password = 'test123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create user in Supabase first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        name: 'Siddhanth Kheria',
        phoneNumber: '+1234567890'
      }
    });

    if (authError || !authData.user) {
      throw authError || new Error('Failed to create Supabase user');
    }

    const supabaseUserId = authData.user.id;

    // Create base user in Prisma with Supabase UUID
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        password: hashedPassword,
        name: 'Siddhanth Kheria',
        role: 'ADMIN',
        phoneNumber: '+1234567890',
      },
    });

    // Create admin record with same UUID
    await prisma.admin.create({
      data: {
        id: supabaseUserId,
      },
    });

    console.log('Created admin user:', user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 