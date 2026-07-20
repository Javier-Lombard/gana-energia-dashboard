import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorMessage } from './ErrorMessage';

const meta = {
  title: 'Components/ui/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  args: {
    message: 'No se pudo conectar con el servidor.',
    onRetry: () => {},
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
