import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Summit from './Summit';

describe('Summit Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Summit />
      </BrowserRouter>
    );
  };

  test('renders upload page with title', () => {
    renderComponent();
    expect(screen.getByText(/Upload Monthly Summit File/i)).toBeInTheDocument();
  });

  test('renders file input', () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/Choose File/i);
    expect(fileInput).toBeInTheDocument();
  });

  test('accepts valid Excel file', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const validFile = new File(['test'], 'summit.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText('summit.xlsx')).toBeInTheDocument();
  });
});
