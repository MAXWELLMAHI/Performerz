import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        classes: resolve(__dirname, 'classes.html'),
        events: resolve(__dirname, 'events.html'),
        blog: resolve(__dirname, 'blog.html'),
        reviews: resolve(__dirname, 'reviews.html')
      }
    }
  }
});
