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

    // Process the new user creation
    const { email, password, name, role, phoneNumber, relationship } = await request.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create user in Prisma first
      const prismaUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phoneNumber,
        },
      });

      // Create user in Supabase
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { prisma_id: prismaUser.id }
      });

      if (createError) {
        // Rollback Prisma creation if Supabase fails
        await prisma.user.delete({ where: { id: prismaUser.id } });
        return NextResponse.json(
          { error: 'Failed to create Supabase user' },
          { status: 500 }
        );
      }

      // Create role-specific record
      switch (role) {
        case 'PARENT':
          await prisma.parent.create({
            data: {
              id: prismaUser.id,
              relationship: relationship as 'MOTHER' | 'FATHER' | 'GUARDIAN'
            },
          });
          break;
        case 'ADMIN':
          await prisma.admin.create({
            data: {
              id: prismaUser.id
            },
          });
          break;
        case 'ASSISTANT':
          await prisma.assistant.create({
            data: {
              id: prismaUser.id
            },
          });
          break;
      }

      return new Response(JSON.stringify({ success: true, user: prismaUser }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create user' 
        }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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