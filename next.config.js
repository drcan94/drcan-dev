// ./next.config.js

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";


/** @type {import("next").NextConfig} */
const config = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [

            {
                protocol: "https",
                hostname: "flagcdn.com",
                port: "",
                pathname: "/**",
            },

            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },

            {
                protocol: "https",
                hostname: "uploadthing.com",
                port: "",
                pathname: "/**",
            },

            {
                protocol: "https",
                hostname: "utfs.io",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default config;
