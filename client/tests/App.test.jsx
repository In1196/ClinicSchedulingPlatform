import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from '../src/App.jsx';

test('increments the displayed counter when its button is clicked', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Count is 0' }));

  expect(screen.getByRole('button', { name: 'Count is 1' })).toBeInTheDocument();
});
