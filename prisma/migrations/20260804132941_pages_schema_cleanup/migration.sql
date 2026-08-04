-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "updatedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "jobTitle" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "submittedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
