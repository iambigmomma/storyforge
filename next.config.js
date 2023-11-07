/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "s.gravatar.com",
      "child-illustration-book.fra1.digitaloceanspaces.com",
      "child-illustration-book.fra1.cdn.digitaloceanspaces.com",
    ],
  },
}

module.exports = nextConfig;
