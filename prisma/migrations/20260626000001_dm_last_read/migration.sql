ALTER TABLE "direct_conversation_participants" ADD COLUMN IF NOT EXISTS "lastReadAt" TIMESTAMP(3);
