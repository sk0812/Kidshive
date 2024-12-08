import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user: requestingUser }, error: authError } = 
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !requestingUser?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, dob, allergies, healthInfo, medications, emergencyContact, parentIds } = await request.json();

    if (!parentIds || parentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one parent ID is required' },
        { status: 400 }
      );
    }

    // Create child with multiple parent connections
    const child = await prisma.child.create({
      data: {
        name,
        dob: new Date(dob),
        allergies: allergies || null,
        healthInfo: healthInfo || null,
        medications: medications || null,
        emergencyContact: emergencyContact || null,
        parents: {
          connect: parentIds.map((id: string) => ({ id }))
        }
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

    return NextResponse.json({ 
      success: true, 
      child 
    });

  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create child' 
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const children = await prisma.child.findMany({
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

    return NextResponse.json({ 
      success: true, 
      children 
    });

  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch children' 
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
} 