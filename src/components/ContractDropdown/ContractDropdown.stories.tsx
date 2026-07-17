import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { ContractDropdown } from './ContractDropdown';
import type { Contract } from '../../types';

const mockContracts: Contract[] = [
  {
    id: 1,
    tipo_suministro: 'Luz',
    estado: 'Activo',
    direccion: 'Calle Colón 60, P7, Valencia',
    tarifa_nombre: 'Tarifa 24 horas',
    potencia_p1_kw: 4.5,
    potencia_p2_kw: 4.5,
    cups: 'ES0021000308343477PX',
  },
  {
    id: 2,
    tipo_suministro: 'Luz',
    estado: 'Activo',
    direccion: 'Avenida Blasco Ibáñez 12, P4, Valencia',
    tarifa_nombre: 'Tarifa Tramos Horarios',
    potencia_p1_kw: 5.75,
    potencia_p2_kw: 3.45,
    cups: 'ES0021000308349981XY',
  },
];

const meta = {
  title: 'Components/ContractDropdown',
  component: ContractDropdown,
  parameters: {
    layout: 'centered',
  },
  args: {
    contracts: mockContracts,
    selectedId: 1,
    onSelect: fn(),
  },
} satisfies Meta<typeof ContractDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const NoSelection: Story = {
  args: {
    selectedId: null,
  },
};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
  },
};
