import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Add the Context type for Next.js 14+ route handlers
type Context = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, email, phoneNumber, currentPassword, newPassword } = body;

    // Verify the user exists in Prisma
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: id },
          { email: email }
        ]
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user in Prisma
    const prismaUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        email,
        phoneNumber,
        ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
      },
    });

    // Update user in Supabase
    const updateData: any = {
      email,
      user_metadata: { name, phoneNumber }
    };

    if (newPassword) {
      updateData.password = newPassword;
    }

    await supabase.auth.admin.updateUserById(existingUser.id, updateData);

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          phoneNumber: prismaUser.phoneNumber,
          role: prismaUser.role
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 