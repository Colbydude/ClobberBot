declare namespace NodeJS {
    interface ProcessEnv {
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_TOKEN: string;
        DISCORD_CLIENT_PUBKEY: string;
        NODE_ENV: string;
    }
}
