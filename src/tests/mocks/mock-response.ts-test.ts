const DEFAULT_MOCK_DELAY_MS = 100;

export function mockResponse<T>(data: T): Promise<T> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(data), DEFAULT_MOCK_DELAY_MS);
	});
}
