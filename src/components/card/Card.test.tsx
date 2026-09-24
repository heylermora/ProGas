import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
	it('maps the direction and align aliases to flex styles', () => {
		render(
			<ChakraProvider>
				<Card direction="row" align="center">
					Content
				</Card>
			</ChakraProvider>
		);

		const card = screen.getByText('Content');
		const styles = window.getComputedStyle(card);
		expect(styles.display).toBe('flex');
		expect(styles.flexDirection).toBe('row');
		expect(styles.alignItems).toBe('center');
		expect(card.hasAttribute('direction')).toBe(false);
		expect(card.hasAttribute('align')).toBe(false);
	});

	it('does not opt into flex display without either alias', () => {
		render(
			<ChakraProvider>
				<Card>Content</Card>
			</ChakraProvider>
		);

		expect(window.getComputedStyle(screen.getByText('Content')).display).not.toBe('flex');
	});
});
