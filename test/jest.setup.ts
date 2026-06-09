process.env.NODE_ENV = 'test';

process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5432';
process.env.DB_USERNAME = process.env.DB_USERNAME ?? 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'test';
process.env.DB_NAME = process.env.DB_NAME ?? 'test';
process.env.DB_SSL = process.env.DB_SSL ?? 'false';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? 'SG.test-sendgrid-key';
process.env.SENDGRID_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL ?? 'noreply@test.local';