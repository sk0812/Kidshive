import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // Verify the requesting user is authenticated
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

    // Check if the requesting user has appropriate role
    const userRecord = await prisma.user.findUnique({
      where: { email: requestingUser.email },
      select: { role: true }
    });

    if (!userRecord || !['ADMIN', 'ASSISTANT'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users who are parents with their children
    const parents = await prisma.user.findMany({
      where: {
        role: 'PARENT',
        parent: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        parent: {
          select: {
            relationship: true,
            children: {
              select: {
                id: true,
                name: true,
                dob: true,
                allergies: true,
                specialNeeds: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to match the expected format
    const formattedParents = parents.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      relationship: user.parent?.relationship,
      children: user.parent?.children || []
    }));

    return NextResponse.json(formattedParents);
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parents' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 