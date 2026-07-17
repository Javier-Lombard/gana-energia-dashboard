import type { Meta, StoryObj } from '@storybook/react-vite';
import { TariffCard } from './TariffCard';
import type { Contract } from '../../types';

const mockContract: Contract = {
  id: 1,
  tipo_suministro: 'Luz',
  estado: 'Activo',
  direccion: 'Calle Colón 60, P7, Valencia',
  tarifa_nombre: 'Tarifa 24 horas',
  potencia_p1_kw: 4.5,
  potencia_p2_kw: 4.5,
  cups: 'ES0021000308343477MX',
};

const meta = {
  title: 'Components/TariffCard',
  component: TariffCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    contract: mockContract,
    loading: false,
  },
} satisfies Meta<typeof TariffCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    contract: null,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    contract: null,
    loading: false,
  },
};
