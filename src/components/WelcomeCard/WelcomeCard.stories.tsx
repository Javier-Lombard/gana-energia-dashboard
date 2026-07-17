import type { Meta, StoryObj } from '@storybook/react-vite';
import { WelcomeCard } from './WelcomeCard';

const meta = {
  title: 'Components/WelcomeCard',
  component: WelcomeCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WelcomeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
