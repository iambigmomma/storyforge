/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "s.gravatar.com",
      "child-illustration-book.fra1.digitaloceanspaces.com",
    ],
  },
}

module.exports = nextConfig;
