import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContractProvider } from '../../context/ContractContext';
import { Header } from './Header';
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
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ContractProvider>
        <Story />
      </ContractProvider>
    ),
  ],
  args: {
    contracts: mockContracts,
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
