import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  args: {
    options: [
      { value: 'eur', label: '€' },
      { value: 'kwh', label: 'kWh' },
    ],
    selected: 'eur',
    onChange: fn(),
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Eur: Story = {};

export const Kwh: Story = {
  args: {
    selected: 'kwh',
  },
};

export const Interactivo: Story = {
  render: (args) => {
    function ToggleWrapper() {
      const [selected, setSelected] = useState(args.selected);
      return (
        <Toggle
          options={args.options}
          selected={selected}
          onChange={setSelected}
        />
      );
    }
    return <ToggleWrapper />;
  },
};
