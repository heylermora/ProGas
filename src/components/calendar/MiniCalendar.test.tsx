import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MiniCalendar from './MiniCalendar';
import { MemoryRouter } from 'react-router-dom';

describe( 'Test MiniCalendar component', () => {
	it('MiniCalendar renders with default values', () => {
		const { getByTestId } = render(
			<MemoryRouter>
				<MiniCalendar selectRange={false} />
			</MemoryRouter>
		);

		const currentMonthLabel = screen.getByText('January 2023');
		expect(currentMonthLabel).toBeTruthy();
	});
});