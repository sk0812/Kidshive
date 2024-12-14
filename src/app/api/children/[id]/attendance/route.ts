import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PrismaClient, MealType, FoodQuantity } from '@prisma/client'
import { startOfDay } from 'date-fns'

const prisma = new PrismaClient()

// Add interface for meal data
interface MealData {
  food: string;
  quantity: FoodQuantity;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        childId: params.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        meals: true,
        naps: true,
        nappyChanges: true,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, checkIn, checkOut, notes, meals, nap, nappyChanges } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Create or update attendance record with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update attendance record
      const attendance = await tx.attendance.upsert({
        where: {
          childId_date: {
            childId: params.id,
            date: startOfDay(new Date(date)),
          },
        },
        update: {
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          notes,
        },
        create: {
          childId: params.id,
          date: startOfDay(new Date(date)),
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          notes,
        },
      });

      // Delete existing related records
      await Promise.all([
        tx.meal.deleteMany({
          where: { attendanceId: attendance.id },
        }),
        tx.nap.deleteMany({
          where: { attendanceId: attendance.id },
        }),
        tx.nappyChange.deleteMany({
          where: { attendanceId: attendance.id },
        }),
      ]);

      // Create meal records
      if (meals) {
        await Promise.all(
          Object.entries(meals as Record<MealType, MealData>)
            .filter(([_, meal]) => meal.food || meal.quantity)
            .map(([type, meal]) =>
              tx.meal.create({
                data: {
                  attendanceId: attendance.id,
                  type: type as MealType,
                  food: meal.food,
                  quantity: meal.quantity,
                },
              })
            )
        );
      }

      // Create nap record
      if (nap?.startTime && nap?.finishTime) {
        await tx.nap.create({
          data: {
            attendanceId: attendance.id,
            startTime: new Date(`${date}T${nap.startTime}:00`),
            finishTime: new Date(`${date}T${nap.finishTime}:00`),
          },
        });
      }

      // Create nappy changes
      if (nappyChanges?.length > 0) {
        await Promise.all(
          nappyChanges
            .filter((change: any) => change.time) // Only create changes with time
            .map((change: any) =>
              tx.nappyChange.create({
                data: {
                  attendanceId: attendance.id,
                  time: new Date(`${date}T${change.time}:00`),
                  notes: change.notes || '',
                },
              })
            )
        );
      }

      return attendance;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating attendance:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 