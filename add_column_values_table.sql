CREATE TABLE IF NOT EXISTS "columnValues" (
  "id" SERIAL PRIMARY KEY,
  "columnId" INTEGER NOT NULL REFERENCES "customColumns" ("id"),
  "rowIndex" INTEGER NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create an index for faster lookups by columnId and rowIndex
CREATE INDEX IF NOT EXISTS "idx_columnValues_columnId" ON "columnValues" ("columnId");
CREATE INDEX IF NOT EXISTS "idx_columnValues_columnId_rowIndex" ON "columnValues" ("columnId", "rowIndex");