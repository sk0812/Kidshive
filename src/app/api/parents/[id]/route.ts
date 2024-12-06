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
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user: requestingUser }, error: authError } = 
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !requestingUser?.email) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, phoneNumber } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    await supabase.auth.admin.updateUserById(params.id, {
      email,
      user_metadata: { name }
    });

    return new NextResponse(
      JSON.stringify({ success: true, user: updatedUser }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating parent:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Failed to update parent' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 