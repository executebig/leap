# Leap: The Platform for Tech Roulette

Leap is the platform server for [Tech Roulette](https://techroulette.xyz). This project is used by Execute Big to run the 2020 Tech Roulette summer program, which means it's a **hyper-specific platform** suitable for only our needs. Of course, you can choose to use Leap for similar online programs like puzzle hunts or online courses, but chances are you'll have to modify a ton of code in this repository to make Leap fit your own needs. 

If you are interested in learning how this platform works, please email [mingjie@executebig.org](mailto:mingjie@executebig.org). I'll be happy to answer any questions and explain how different parts of this codebase work together, but unfortunately, I won't be able to provide any support to help you adapt this platform for your own needs.

Please submit issues for any bugs reports or feature requests.

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
* `DISCORD_CLIENT`: Discord client ID
* `DISCORD_SECRET`: Discord client secret
* `DISCORD_BOT_TOKEN`: Discord bot token
* `DISCORD_GUILD`: Discord guild ID
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

## Contributing

Due to the nature of Tech Roulette as a proprietary program of Execute Big, not all feature requests and contribution tickets will be accepted. If you would like to suggest a feature, please create an issue. 

## Credits

This project is written by Mingjie Jiang ([@itsmingjie](https://github.com/itsmingjie)) and Brian Xiang ([@cf12](https://github.com/cf12) with contributions from the community for [Execute Big](https://executebig.org), a 501(c)(3) nonprofit.

## License

This project is licensed under the terms of the MIT license. See [LICENSE](LICENSE) for details.
