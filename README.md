# Leap

## Setup

### Setup Environment Variables

See [.env.example](.env.example). Copy the file to `.env`.

* `PORT`: (Optional) Server port. Default 3000.
* `NODE_ENV`: (Optional) Server environment: "development", "production", or "testing". Default development.
* `DATABASE_URL`: PostgreSQL database connection string.
* `REDIS_URL`: Redis server connection string.
* `POSTMARK_API`: Postmark email sending API.
* `POSTMARK_FROM`: Transactional email from address.
* `AUTH_SECRET`: JWT secret. Generate with `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`.
* `COOKIE_SECRET`: 256-bit key for cookies.
* `SESSION_SECRET`: 256-bit key for sessions.
* `HCAPTCHA_SITEKEY` & `HCAPTCHA_SECRET`: API keys for hCaptcha.
* `EO_API_KEY` and `EO_LIST_ID`: API key and list ID for Email Octopus.
* `DOMAIN`: Domain used for signing JWT and setting the root for client-facing emails.
* `SLACK_BOT_TOKEN`: Slack bot token
* `SLACK_SUBMISSIONS_CHANNEL`: Name of Slack channel to post submission notifications
* `FLAGS`: Debugging/Developing flags for special features, separated by commas. Available flags:
    * `print_email`: Will print important email contents to log instead of actually sending the email.
    * `print_submission`: Will print submissions instead of sending to Slack
    * `disable_eo`: Will disable all outgoing EmailOctopus actions

### Setup PostgreSQL Schema

See [sql/db.sql](sql/db.sql). Execute all queries.

### Develop & Run

```bash
# install all dependencies with pnpm
pnpm i

# run server
pnpm start
```
