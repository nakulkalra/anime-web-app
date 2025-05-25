import dotenv from 'dotenv';

dotenv.config();


const config = {

    stripe : {
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
        STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY!,
    },
    JWT : {
        JWT_SECRET: process.env.JWT_SECRET!,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    },
    NODE_ENV: process.env.NODE_ENV!,
    PORT: process.env.PORT!,

    session : {
        SESSION_SECRET: process.env.SESSION_SECRET!,
    },
    google : {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord : {
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
    },
    URLS : {
        baseFrontendURL: process.env.NODE_ENV === 'PRODUCTION' ? 'http://mydomain.com' : 'http://localhost:3000',
        baseAdminFrontendURL: process.env.NODE_ENV === 'PRODUCTION' ? 'http://mydomain.com' : 'http://localhost:3001',
        baseBackendURL: process.env.NODE_ENV === 'PRODUCTION' ? 'http://mydomain.com' : 'http://localhost:4000',
    }



}

export default config;