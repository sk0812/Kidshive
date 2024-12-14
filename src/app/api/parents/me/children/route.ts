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

    // Verify the token and get the user ID
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the parent and their children
    const parent = await prisma.parent.findFirst({
      where: {
        user: {
          id: user.id
        }
      },
      include: {
        children: true
      },
    });

    if (!parent) {
      return NextResponse.json({ 
        success: true,
        children: [] 
      });
    }

    return NextResponse.json({
      success: true,
      children: parent.children,
    });

  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 