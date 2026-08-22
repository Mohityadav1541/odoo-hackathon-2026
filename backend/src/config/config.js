import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || "hackathon_super_secret_key_2026",
  AFFINDA_URL: process.env.AFFINDA_URL
}

export default config
