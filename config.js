require("dotenv").config()

module.exports = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL,
    production: process.env.NODE_ENV === "production",
    testing: process.env.NODE_ENV === "testing",
    auth0: {
        client: process.env.AUTH0_CLIENT,
        secret: process.env.AUTH0_SECRET,
        domain: process.env.AUTH0_DOMAIN
    },
    database: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL,
    session: {
        secret: process.env.SESSION_SECRET
    },
    cookie: {
        secret: process.env.COOKIE_SECRET
    }
}