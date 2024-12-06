import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { name, email, phoneNumber, relationship } = await request.json();

    // Verify user exists before updating
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      // Update both user and parent records in a transaction
      const [updatedUser, updatedParent] = await prisma.$transaction([
        prisma.user.update({
          where: { id: params.id },
          data: {
            name,
            email,
            phoneNumber,
          },
        }),
        prisma.parent.update({
          where: { id: params.id },
          data: {
            relationship,
          },
        })
      ]);

      // Update Supabase user
      await supabase.auth.admin.updateUserById(params.id, {
        email,
        user_metadata: { name, phoneNumber }
      });

      return NextResponse.json({ 
        success: true, 
        user: {
          ...updatedUser,
          relationship: updatedParent.relationship
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to update user in database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating parent:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request or server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 