import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  args: {
    currentPage: 1,
    totalPages: 3,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PrimeraPagina: Story = {};

export const PaginaIntermedia: Story = {
  args: {
    currentPage: 2,
  },
};

export const UltimaPagina: Story = {
  args: {
    currentPage: 3,
  },
};

export const UnaSolaPagina: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};

export const Interactivo: Story = {
  render: (args) => {
    function PaginationWrapper() {
      const [currentPage, setCurrentPage] = useState(args.currentPage);
      return (
        <Pagination
          currentPage={currentPage}
          totalPages={args.totalPages}
          onPageChange={setCurrentPage}
        />
      );
    }
    return <PaginationWrapper />;
  },
};
