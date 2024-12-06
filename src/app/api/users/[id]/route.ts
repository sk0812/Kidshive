import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, email, phoneNumber, currentPassword, newPassword } = body;

    // Verify the user exists in Prisma
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: params.id },
          { email: email }
        ]
      }
    });

    if (!existingUser) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'User not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          phoneNumber: prismaUser.phoneNumber,
          role: prismaUser.role
        }
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 