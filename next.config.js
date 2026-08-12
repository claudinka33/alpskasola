/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.cdn.filesafe.space' },
      { protocol: 'https', hostname: 'static.wixstatic.com' },
    ],
  },
  // Trajne preusmeritve starih Wix naslovov na nove strani (ohranitev Google uvrstitev)
  async redirects() {
    return [
      { source: '/copy-of-te%C4%8Daji-smu%C4%8Danja-in-bordanja', destination: '/sola-smucanja', permanent: true },
      { source: '/copy-of-tecaji-smucanja-in-bordanja', destination: '/sola-smucanja', permanent: true },
      { source: '/prijavnica-tecaj-plavanja', destination: '/prijava?program=plavalni-tecaj', permanent: true },
      { source: '/pocitnice-na-snegu', destination: '/sola-smucanja', permanent: true },
      { source: '/zimske-pocitnice', destination: '/sola-smucanja', permanent: true },
      { source: '/dan-odprtih-vrat', destination: '/', permanent: true },
      { source: '/vrtec-mali-grof', destination: '/sportna-abeceda', permanent: true },
      { source: '/book-online', destination: '/prijava', permanent: true },
      { source: '/challenges', destination: '/', permanent: true },
      { source: '/groups', destination: '/', permanent: true },
      { source: '/file-share', destination: '/', permanent: true },
      { source: '/shared-gallery', destination: '/', permanent: true },
    ];
  },
};
