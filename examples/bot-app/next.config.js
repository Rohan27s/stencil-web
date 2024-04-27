/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(
  withPWA({
    pwa: {
      dest: 'public',
      register: true,
      skipWaiting: true,
    },
    env: {
      NEXT_PUBLIC_ENV: 'PRODUCTION', // your next configs go here
    },
    reactStrictMode: false,
    typescript: {
      ignoreBuildErrors: false,
    },
    compiler: {
      removeConsole: true,
    },
    i18n: {
      locales: ['en'], // add more lang codes if support added
      defaultLocale: 'en',
    },
    // webpack: (config, options) => {
    //   // Add the Babel configuration
    //   config.module.rules.push({
    //     test: /\.(js|jsx|ts|tsx)$/,
    //     exclude: /node_modules/,
    //     use: {
    //       loader: 'babel-loader',
    //       options: {
    //         presets: ['next/babel'],
    //         plugins: [
    //           [
    //             'styled-components',
    //             { ssr: true, displayName: true, preprocess: false },
    //           ],
    //         ],
    //       },
    //     },
    //   })

    //   // Important: return the modified config
    //   config.module.rules.push({
    //     test: /\.(tsx|ts|jsx|js)$/,
    //     include: path.resolve(__dirname, '../../packages/providers'),
    //     use: options.defaultLoaders.babel,
    //   })

    //   return config
    // },
  })
)

const withTM = require('next-transpile-modules')([
  '@stencil/provider',
  '@stencil/hooks',
  '@stencil/molecules',
  '@stencil/pages',
])

module.exports = withTM({})
