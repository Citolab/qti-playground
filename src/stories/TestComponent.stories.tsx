import type { Meta, StoryObj } from '@storybook/react';

// Simple test component to verify Storybook setup
const TestComponent = ({ text }: { text: string }) => (
  <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
    <h2>QTI Playground Test</h2>
    <p>{text}</p>
  </div>
);

const meta: Meta<typeof TestComponent> = {
  title: 'QTI/Test Component',
  component: TestComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'test'],
  argTypes: {
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Storybook is working for QTI Playground!',
  },
};