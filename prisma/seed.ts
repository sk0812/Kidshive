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
    // Create base user in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Siddhanth Kheria',
        role: 'ADMIN',
        phoneNumber: '+1234567890',
      },
    });

    // Create admin record
    await prisma.admin.create({
      data: {
        id: user.id,
      },
    });

    // Create user in Supabase
    const { error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prisma_id: user.id }
    });

    if (authError) {
      // Rollback Prisma records if Supabase creation fails
      await prisma.admin.delete({ where: { id: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      throw authError;
    }

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