import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n.ts' 
);

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
            {
                protocol: 'https',
                hostname: 'is1-ssl.mzstatic.com',
            },
        ],
    },
};

export default withNextIntl(nextConfig);