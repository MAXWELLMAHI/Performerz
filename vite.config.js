import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        classes: resolve(__dirname, 'classes.html'),
        blog: resolve(__dirname, 'blog.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        cookies: resolve(__dirname, 'cookie-policy.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
