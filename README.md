# Leap 

## Setup

### Setup Environment Variables

See [.env.example](.env.example). Copy the file to `.env`. 

* `PORT`: (Optional) Server port. Default 3000.
* `NODE_ENV`: (Optional) Server environment: "development", "production", or "testing". Default development. 
* `DATABASE_URL`: PostgreSQL database connection string. 
* `REDIS_URL`: Redis server connection string.
* `EMAIL_URL`: SMTP/SMTPS connection string, see [Nodemailer](https://nodemailer.com/smtp/).
* `AUTH_SECRET`: JWT secret. Generate with `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`.
* `COOKIE_SECRET`: 256-bit key for cookies.
* `SESSION_SECRET`: 256-bit key for sessions.
* `DOMAIN`: Domain used for signing JWT and setting the root for client-facing emails.

### Setup PostgreSQL Schema

See [sql/db.sql](sql/db.sql). Execute all queries. 

If database reports `uuid_generate_v4()` does not exist, run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` before the script.

### Develop & Run

```bash
# install all dependencies with pnpm
pnpm i

# run server
pnpm start
```
