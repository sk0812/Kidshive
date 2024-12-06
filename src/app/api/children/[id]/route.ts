import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
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

    const child = await prisma.child.findUnique({
      where: { id: params.id },
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
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Child not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify(child), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching child:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Failed to fetch child details' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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

    const { name, dob, allergies, specialNeeds, healthInfo, medications, emergencyContact } = await request.json();

    const updatedChild = await prisma.child.update({
      where: { id: params.id },
      data: {
        name,
        dob: new Date(dob),
        allergies,
        specialNeeds,
        healthInfo,
        medications,
        emergencyContact,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, child: updatedChild }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating child:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Failed to update child' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 