-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('GOD', 'MANAGER', 'HELPER');

-- CreateTable
CREATE TABLE "Admins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "AdminRole" NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
