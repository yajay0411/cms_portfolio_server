import Joi from 'joi';

// Ensure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Define environment variables schema
const envVarsSchema = Joi.object({
  // General
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().default(8080),
  SERVER_URL: Joi.string().uri().default('http://localhost:8080'),

  // Frontend
  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database
  MONGODB_URI: Joi.string().required().description('MongoDB connection string is required'),

  // Email Service
  SEND_GRID_API_SECRET: Joi.string().required().description('SendGrid API key is required'),
  EMAIL_FROM: Joi.string().email().default('noreply@example.com'),

  // Tokens
  API_ACCESS_TOKEN_SECRET: Joi.string().min(32).required().description('API access token secret is required (min 32 chars)'),
  API_REFRESH_TOKEN_SECRET: Joi.string().min(32).required().description('API refresh token secret is required (min 32 chars)')
}).unknown(true);

// Validate environment variables
const { value: envVars, error } = envVarsSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
  convert: true
});

if (error) {
  // eslint-disable-next-line no-console
  console.error('Environment variables validation failed:');
  error.details.forEach((detail: { message: string }) => {
    // eslint-disable-next-line no-console
    console.error(`- ${detail.message}`);
  });
  process.exit(1);
}

// Define the config type
interface Config {
  ENV: string;
  PORT: number;
  SERVER_URL: string;
  CLIENT_URL: string;
  MONGODB_URI: string;
  SEND_GRID_API_SECRET: string;
  EMAIL_FROM: string;
  API_ACCESS_TOKEN_SECRET: string;
  API_REFRESH_TOKEN_SECRET: string;
}

// Create the config object with type safety
const config: Config = Object.freeze({
  // General
  ENV: envVars.NODE_ENV as string,
  PORT: Number(envVars.PORT),
  SERVER_URL: envVars.SERVER_URL as string,

  // Frontend
  CLIENT_URL: envVars.CLIENT_URL as string,

  // Email Service
  SEND_GRID_API_SECRET: envVars.SEND_GRID_API_SECRET as string,
  EMAIL_FROM: envVars.EMAIL_FROM as string,

  // Database
  MONGODB_URI: envVars.MONGODB_URI as string,

  // Tokens
  API_ACCESS_TOKEN_SECRET: envVars.API_ACCESS_TOKEN_SECRET as string,
  API_REFRESH_TOKEN_SECRET: envVars.API_REFRESH_TOKEN_SECRET as string
});

// Log config in development
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.table(config);
}

export type AppConfig = typeof config;
export default config;
