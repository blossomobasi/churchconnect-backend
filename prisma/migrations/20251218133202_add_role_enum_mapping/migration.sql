/*
  Warnings:

  - The values [TITHE,OFFERING,SEED,OTHER] on the enum `DonationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEFAULT,GOOGLE] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,PASTOR,MEMBER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DonationType_new" AS ENUM ('tithe', 'offering', 'seed', 'other');
ALTER TABLE "Donation" ALTER COLUMN "type" TYPE "DonationType_new" USING ("type"::text::"DonationType_new");
ALTER TYPE "DonationType" RENAME TO "DonationType_old";
ALTER TYPE "DonationType_new" RENAME TO "DonationType";
DROP TYPE "public"."DonationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Provider_new" AS ENUM ('default', 'google');
ALTER TABLE "public"."User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "Provider_new" USING ("provider"::text::"Provider_new");
ALTER TYPE "Provider" RENAME TO "Provider_old";
ALTER TYPE "Provider_new" RENAME TO "Provider";
DROP TYPE "public"."Provider_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'default';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'member', 'department_head');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'member',
ALTER COLUMN "provider" SET DEFAULT 'default';
