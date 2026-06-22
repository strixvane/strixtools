import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
        coverage: {
            enabled: true,
            provider: 'v8',
            include: ['js/**/*.js'],
            reporter: ['text', 'lcov', 'html']
        }
    }
});
