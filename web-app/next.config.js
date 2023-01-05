/** @type {import('next').NextConfig} */
/* import { withSentryConfig } from '@sentry/nextjs';

const moduleExports = {
  reactStrictMode: true,
  swcMinify: true,
  sentry: {
    hideSourceMaps: true,
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

export default withSentryConfig(moduleExports, sentryWebpackPluginOptions); 
@sentry/nextjs
@sentry/wizard
"type": module
*/

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}  

module.exports = nextConfig