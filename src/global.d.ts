declare namespace NodeJS {
    interface ProcessEnv {
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_TOKEN: string;
        DISCORD_CLIENT_PUBKEY: string;

        DB_HOST: string;
        DB_PORT: string;
        DB_DATABASE: string;
        DB_USERNAME: string;
        DB_PASSWORD: string;

        NODE_ENV: string;
    }
}
