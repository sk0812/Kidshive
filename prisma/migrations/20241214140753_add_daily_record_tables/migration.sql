-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('SNACKS', 'LUNCH', 'TEA');

-- CreateEnum
CREATE TYPE "FoodQuantity" AS ENUM ('GOOD', 'AVERAGE', 'BELOW_AVERAGE');

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "food" TEXT NOT NULL,
    "quantity" "FoodQuantity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nap" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "finishTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NappyChange" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NappyChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nap" ADD CONSTRAINT "Nap_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NappyChange" ADD CONSTRAINT "NappyChange_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
