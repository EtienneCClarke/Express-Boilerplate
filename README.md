# Express.js Boilerplate

Boilerplate for an Express.js API that uses JWT (Json Web Tokens) for authorisation and Stripe for payments.

### JWT Authentication

This project uses JWT (Json Web Tokens) for user authentication;
to generate your JWT secrets run this command in your terminal.

```bash
node -e "const crypto = require('crypto'); console.log({
    JWT_ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
    JWT_REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex')
})"
```

Adjust token expiration in the config found at `/api/configs/jwt.config.ts`.

### Stripe

Create a stripe account and then add you `SECRET_KEY` and `PUBLIC_KEY` to your .env file.

Make sure to also add your client URL either through environment variables or in the config
found at `/api/configs/stripe.config.ts`.

### Clone and Deploy

```bash
git clone 
```

Install dependencies:

```bash
npm install
```

Then run the app at the root of the repository:

```bash
npm run dev
```