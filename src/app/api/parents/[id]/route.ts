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
  // Await the params to fix Next.js warning
  const id = await params.id;

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
      where: { id }
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
          where: { id },
          data: {
            name,
            email,
            phoneNumber,
          },
        }),
        prisma.parent.update({
          where: { id },
          data: {
            relationship,
          },
        })
      ]);

      // Update Supabase user
      await supabase.auth.admin.updateUserById(id, {
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await the params to fix Next.js warning
  const id = await params.id;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      console.log('API: Starting delete process for user:', id);
      
      // Get user from Supabase Auth first to verify existence
      const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(id);
      
      if (getUserError) {
        console.error('Error getting Supabase auth user:', getUserError);
      } else if (authUser?.user) {
        // Only attempt to delete if user exists in Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
          console.error('Error deleting Supabase auth user:', authError);
          console.error('Full auth error:', JSON.stringify(authError, null, 2));
        }
      } else {
        console.log('User not found in Supabase Auth, skipping auth deletion');
      }

      // Delete from database
      await prisma.$transaction([
        prisma.parent.delete({
          where: { id },
        }),
        prisma.user.delete({
          where: { id },
        }),
      ]);

      console.log('API: Successfully deleted user from database');
      return NextResponse.json({ success: true });

    } catch (innerError) {
      console.error('Inner operation error:', innerError);
      throw innerError;
    }

  } catch (error) {
    console.error('Error deleting parent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete parent' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 