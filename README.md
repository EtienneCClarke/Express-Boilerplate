# Express.js Boilerplate

Boilerplate for an Express.js API that uses JWT (Json Web Tokens) for authorisation and Stripe for payments.

## JWT Authentication

This project uses JWT (Json Web Tokens) for user authentication;
to generate your JWT secrets run this command in your terminal.

```bash
node -e "const crypto = require('crypto'); console.log({
    JWT_ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
    JWT_REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex')
})"
```

Adjust token expiration in the config found at `/api/configs/jwt.config.ts`.

## Stripe

Create a stripe account and then add your `SECRET_KEY` and `PUBLIC_KEY` to your .env file.

Make sure to also add your client URL either through environment variables or in the config
found at `/api/configs/stripe.config.ts`.

### Login

You must login in order to use the Stripe CLI.
```bash
stripe login
```

### Testing local endpoint

Run this command to forward stripe events to your local endpoint (<strong>test mode</strong>).
```bash
stripe listen --forward-to localhost:3000/stripe/webhook
```

To disable HTTPS certificate verification, use the `--skip-verify` flag.

You can customise events using the events flag to pass in a comma seperated list of events.
```bash
--events payment_intent.created,customer.created,payment_intent.succeeded,checkout.session.completed,payment_intent.payment_failed
```

To check webhook signatures, use the `{{WEBHOOK_SIGNING_SECRET}}` from the initial output of the listen command.
```bash
Ready! Your webhook signing secret is '{{WEBHOOK_SIGNING_SECRET}}' (^C to quit)
```

### Triggering events

To trigger an event use the `trigger` command in your cli. Here is an example to trigger a successful payment intent.
```bash
stripe trigger payment_intent.succeeded
```

## Clone and Deploy

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