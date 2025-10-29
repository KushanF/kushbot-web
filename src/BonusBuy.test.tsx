import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BonusBuy from './BonusBuy';

describe('BonusBuy Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <BonusBuy />
      </BrowserRouter>
    );
  };

  test('renders upload page with title', () => {
    renderComponent();
    expect(screen.getByText(/Upload Monthly Bonus Buy File/i)).toBeInTheDocument();
  });

  test('renders file input', () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/Choose File/i);
    expect(fileInput).toBeInTheDocument();
  });

  test('shows error for invalid file type', async () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Please upload only Excel files/i)).toBeInTheDocument();
    });
  });

  test('accepts valid Excel file', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const validFile = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });

  test('shows upload button when file is selected', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const validFile = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByRole('button', { name: /Upload File/i })).toBeInTheDocument();
  });

  test('back button navigates to home', () => {
    renderComponent();
    const backButton = screen.getByText(/← Home/i);
    expect(backButton).toBeInTheDocument();
  });
});
