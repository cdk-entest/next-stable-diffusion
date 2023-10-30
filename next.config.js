const nextConfig = {
    experimental: {
        serverActions: true
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true,
    }, 
    output: 'standalone'
};

module.exports = nextConfig;