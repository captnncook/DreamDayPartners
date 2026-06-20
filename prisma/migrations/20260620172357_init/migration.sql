-- DreamDay Partners — PostgreSQL initial migration

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "vendorType" TEXT,
    "avatar" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "weddings" (
    "id" TEXT NOT NULL,
    "weddingCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "coupleEmail1" TEXT NOT NULL,
    "coupleEmail2" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "weddings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "weddings_weddingCode_key" ON "weddings"("weddingCode");

CREATE TABLE "wedding_team_members" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wedding_team_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "wedding_team_members_weddingId_userId_key" ON "wedding_team_members"("weddingId", "userId");

CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wedding_vendors" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'contacted',
    "portalAccess" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "contractUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wedding_vendors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "wedding_vendors_weddingId_vendorId_key" ON "wedding_vendors"("weddingId", "vendorId");

CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "side" TEXT NOT NULL DEFAULT 'both',
    "rsvpStatus" TEXT NOT NULL DEFAULT 'invited',
    "dietary" TEXT,
    "plusOne" BOOLEAN NOT NULL DEFAULT false,
    "tableId" TEXT,
    "rsvpToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "guests_rsvpToken_key" ON "guests"("rsvpToken");

CREATE TABLE "seating_tables" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 8,
    "notes" TEXT,
    CONSTRAINT "seating_tables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "budgets_weddingId_key" ON "budgets"("weddingId");

CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorId" TEXT,
    "payStatus" TEXT NOT NULL DEFAULT 'pending',
    "invoiceUrl" TEXT,
    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "category" TEXT NOT NULL DEFAULT 'general',
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "draaiboeken" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "draaiboeken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "draaiboek_items" (
    "id" TEXT NOT NULL,
    "draaiboekId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "assignedUserId" TEXT,
    "vendorId" TEXT,
    "notes" TEXT,
    CONSTRAINT "draaiboek_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "vendorId" TEXT,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_reads" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "message_reads_messageId_userId_key" ON "message_reads"("messageId", "userId");

CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'overig',
    "visibility" TEXT NOT NULL DEFAULT 'team',
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weddingId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "weddings" ADD CONSTRAINT "weddings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wedding_team_members" ADD CONSTRAINT "wtm_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wedding_team_members" ADD CONSTRAINT "wtm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wedding_vendors" ADD CONSTRAINT "wv_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wedding_vendors" ADD CONSTRAINT "wv_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "seating_tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seating_tables" ADD CONSTRAINT "st_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_items" ADD CONSTRAINT "bi_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_items" ADD CONSTRAINT "bi_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "draaiboeken" ADD CONSTRAINT "draaiboeken_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "draaiboek_items" ADD CONSTRAINT "di_draaiboekId_fkey" FOREIGN KEY ("draaiboekId") REFERENCES "draaiboeken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "draaiboek_items" ADD CONSTRAINT "di_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "message_threads" ADD CONSTRAINT "mt_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "message_reads" ADD CONSTRAINT "mr_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "att_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "docs_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "docs_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notif_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notif_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
