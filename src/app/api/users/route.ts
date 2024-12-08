import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { email, password, name, role, phoneNumber, relationship } = await request.json();

    // Hash password for Prisma storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase first to get the UUID
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phoneNumber }
    });

    if (createError || !authData.user) {
      return NextResponse.json(
        { error: 'Failed to create Supabase user' },
        { status: 500 }
      );
    }

    const supabaseUserId = authData.user.id;

    try {
      // Create user in Prisma with Supabase UUID
      const prismaUser = await prisma.user.create({
        data: {
          id: supabaseUserId, // Use Supabase UUID
          email,
          password: hashedPassword,
          name,
          role,
          phoneNumber,
        },
      });

      // Create role-specific record with same UUID
      switch (role) {
        case 'PARENT':
          await prisma.parent.create({
            data: {
              id: supabaseUserId,
              relationship: relationship as 'MOTHER' | 'FATHER' | 'GUARDIAN'
            },
          });
          break;
        case 'ADMIN':
          await prisma.admin.create({
            data: {
              id: supabaseUserId
            },
          });
          break;
        case 'ASSISTANT':
          await prisma.assistant.create({
            data: {
              id: supabaseUserId
            },
          });
          break;
      }

      return NextResponse.json({ 
        success: true, 
        user: prismaUser 
      });

    } catch (dbError) {
      // If database creation fails, delete the Supabase user
      await supabase.auth.admin.deleteUser(supabaseUserId);
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify the requesting user is authenticated and is an admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and get the user
    const { data: { user: requestingUser }, error: authError } = 
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !requestingUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the requesting user is an admin
    const admin = await prisma.user.findUnique({
      where: { email: requestingUser.email },
      select: { role: true }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 