import { readFileSync } from 'fs';

import { expect, test } from '../../utils/test-utils.js';

test('open redirect fuzz testing', async ({ logedPage }) => {
	test.slow();

	await test.step('fuzz open redirect', async () => {
		await logedPage.page.goto('/folders');
		await logedPage.page.getByTestId('add-button').click();
		await logedPage.page.getByTestId('form-input-name').fill(crypto.randomUUID());
		await logedPage.page.getByTestId('save-button').click();
	});

	// Payloads courtesy of PayloadsAllTheThings
	// https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Open%20Redirect/Intruder/Open-Redirect-payloads.txt
	const payloadsFile = './tests/fuzz/open-redirect/payloads.txt';
	const payloads = readFileSync(payloadsFile, 'utf8').split('\n');

	const href = await logedPage.page
		.getByTestId('tablerow-edit-button')
		.getAttribute('href')
		.then((href) => href!.split('?')[0]);

	const currentURL = logedPage.page.url();
	const parsedURL = new URL(currentURL);
	const hostname = parsedURL.hostname;

	for await (const [index, payload] of payloads.entries()) {
		await test.step(`fuzz open redirect with payload: ${payload} (${index + 1}/${payloads.length})`, async () => {
			await logedPage.page.goto(`${href}?next=${payload}`);
			await logedPage.page.getByTestId('cancel-button').click();
			// Redirecting to next MUST not redirect to another domain
			await expect
				.soft(logedPage.page)
				.toHaveURL(new RegExp(`^.*${hostname}.*$`), { timeout: 1000 });
		});
	}
});
