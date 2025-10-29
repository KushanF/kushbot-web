import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MonthlyPromoPlan from './MonthlyPromoPlan';

describe('MonthlyPromoPlan Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MonthlyPromoPlan />
      </BrowserRouter>
    );
  };

  test('renders upload page with title', () => {
    renderComponent();
    expect(screen.getByText(/Upload Monthly Promo Plan File/i)).toBeInTheDocument();
  });

  test('renders file input', () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/Choose File/i);
    expect(fileInput).toBeInTheDocument();
  });

  test('accepts valid Excel file', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const validFile = new File(['test'], 'promo.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText('promo.xlsx')).toBeInTheDocument();
  });
});
