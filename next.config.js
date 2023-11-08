/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "s.gravatar.com",
      "storyforge.fra1.digitaloceanspaces.com",
      "storyforge.fra1.cdn.digitaloceanspaces.com",
    ],
  },
}

module.exports = nextConfig;
