import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch parents with their children
    const parents = await prisma.parent.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            dob: true,
            allergies: true,
            healthInfo: true,
            medications: true,
            emergencyContact: true,
          },
        },
      },
    });

    // Transform the data to match the Parent type
    const transformedParents = parents.map(parent => ({
      id: parent.id,
      name: parent.user.name,
      email: parent.user.email,
      phoneNumber: parent.user.phoneNumber,
      relationship: parent.relationship,
      children: parent.children,
    }));

    // Make sure we return an array in the parents property
    return NextResponse.json({
      success: true,
      parents: transformedParents
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 