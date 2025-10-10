import { NextConfig } from "next";
import pkg from './package.json' assert { type: 'json' };


// next.config.js
const nextConfig:NextConfig = {
  env:{
    APP_VERSION: pkg.version
  },
  turbopack: {  
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};

module.exports = nextConfig;