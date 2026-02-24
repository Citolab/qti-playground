import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: [
    { from: '../storybook-assets', to: '/storybook-assets-zips' },
  ],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        global: 'globalThis',
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: ['@citolab/qti-components', '@citolab/qti-api'],
        exclude: ['lucide-react'],
      },
    };
  },
};

export default config;
