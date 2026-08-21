import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/sourcesea",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  // Placeholder: once Supabase Google OAuth is added, verify the
  // incoming JWT here and attach req.userId in a middleware.
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};
