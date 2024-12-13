import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Update the type definition for context
type Context = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: Context
) {
  try {
    // Await the params
    const { id } = await context.params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        parents: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(child);

  } catch (error) {
    console.error('Error fetching child details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch child details' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    // Await the params
    const { id } = await context.params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, dob, allergies, healthInfo, medications, emergencyContact } = await request.json();

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        name,
        dob: new Date(dob),
        allergies,
        healthInfo,
        medications,
        emergencyContact,
      },
      include: {
        parents: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, child: updatedChild });

  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update child' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    // Await the params
    const { id } = await context.params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the child
    await prisma.child.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete child' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 