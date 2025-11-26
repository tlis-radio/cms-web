/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'directus.vs02.tlis.sk',
            },
            {
                protocol: 'https',
                hostname: 'directus-dev.vs02.tlis.sk',
            },
            {
                protocol: 'https',
                hostname: 'cms.tlis.sk',
            },
        ],
    },
};

export default nextConfig;
