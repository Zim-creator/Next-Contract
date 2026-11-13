import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	deleteItem,
	getItem,
	getItems,
	upsertItem,
} from './backend/items.ts-test';
import {
	itemRecords,
	itemTranslationRecords,
	resetItemStore,
} from './mocks/item-store.ts-test';

beforeEach(() => resetItemStore());

describe('mock response delay', () => {
	it('resolves backend data after the delay', async () => {
		vi.useFakeTimers();
		try {
			let resolved = false;
			const result = getItem({ id: '1' }).then((item) => {
				resolved = true;
				return item;
			});

			await vi.advanceTimersByTimeAsync(99);
			expect(resolved).toBe(false);
			await vi.advanceTimersByTimeAsync(1);
			expect(await result).toMatchObject({ id: '1' });
			expect(resolved).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('getItem', () => {
	it('retrieves an item with its fields and all available translations', async () => {
		await expect(getItem({ id: '1' })).resolves.toEqual(
			expect.objectContaining({
				id: '1',
				price: 100,
				status: 'ACTIVE',
				name: { en: 'Apple', uk: 'Яблуко' },
				description: expect.objectContaining({
					en: expect.any(String),
					uk: expect.any(String),
				}),
			}),
		);
	});
	it('projects only English translations', async () => {
		await expect(
			getItem({ id: '1', language: 'en' }),
		).resolves.toMatchObject({
			name: { en: 'Apple' },
			description: { en: expect.any(String) },
		});
	});
	it('projects only Ukrainian translations', async () => {
		await expect(
			getItem({ id: '1', language: 'uk' }),
		).resolves.toMatchObject({
			name: { uk: 'Яблуко' },
			description: { uk: expect.any(String) },
		});
	});
	it('returns empty objects when the requested translation is missing', async () => {
		await expect(
			getItem({ id: '2', language: 'uk' }),
		).resolves.toMatchObject({ name: {}, description: {} });
	});
	it('returns null for an unknown ID', async () => {
		await expect(getItem({ id: 'unknown' })).resolves.toBeNull();
	});
});

describe('getItems', () => {
	it('returns all items with the matching count', async () => {
		const result = await getItems();
		expect(result.count).toBe(3);
		expect(result.data).toHaveLength(3);
	});
	it('projects the requested language for each item', async () => {
		const result = await getItems({ language: 'uk' });
		for (const item of result.data)
			expect(Object.keys(item.name)).toEqual(
				item.id === '2' ? [] : ['uk'],
			);
	});
	it('filters by status', async () => {
		const result = await getItems({ filters: { status: 'ACTIVE' } });
		expect(result.count).toBe(2);
		expect(result.data.map(({ id }) => id).sort()).toEqual(['1', '2']);
	});
	it('paginates while retaining the pre-pagination count', async () => {
		const first = await getItems({ page: 1, perPage: 2 });
		const second = await getItems({ page: 2, perPage: 2 });
		expect(first.count).toBe(3);
		expect(first.data).toHaveLength(2);
		expect(second.count).toBe(3);
		expect(second.data).toHaveLength(1);
	});
	it('sorts by price in either direction', async () => {
		expect(
			(await getItems({ sortBy: 'price', sortOrder: 'ASC' })).data.map(
				({ id }) => id,
			),
		).toEqual(['2', '1', '3']);
		expect(
			(await getItems({ sortBy: 'price', sortOrder: 'DESC' })).data.map(
				({ id }) => id,
			),
		).toEqual(['3', '1', '2']);
	});
	it('sorts createdAt deterministically', async () => {
		expect(
			(
				await getItems({ sortBy: 'createdAt', sortOrder: 'ASC' })
			).data.map(({ id }) => id),
		).toEqual(['1', '2', '3']);
	});
	it('sorts names by requested language and puts missing translations last', async () => {
		expect(
			(
				await getItems({
					sortBy: 'name',
					language: 'uk',
					sortOrder: 'ASC',
				})
			).data.map(({ id }) => id),
		).toEqual(['3', '1', '2']);
	});
	it('combines filtering, sorting, and pagination', async () => {
		const result = await getItems({
			filters: { status: 'ACTIVE' },
			sortBy: 'price',
			sortOrder: 'DESC',
			page: 2,
			perPage: 1,
		});
		expect(result.count).toBe(2);
		expect(result.data.map(({ id }) => id)).toEqual(['2']);
	});
});

describe('deleteItem', () => {
	it('returns the deleted item and removes its records', async () => {
		const deleted = await deleteItem({ id: '1' });
		expect(deleted?.name).toMatchObject({ en: 'Apple', uk: 'Яблуко' });
		await expect(getItem({ id: '1' })).resolves.toBeNull();
		expect(itemRecords.some(({ id }) => id === '1')).toBe(false);
		expect(
			itemTranslationRecords.some(({ itemId }) => itemId === '1'),
		).toBe(false);
	});
	it('returns null for an unknown ID', async () => {
		await expect(deleteItem({ id: 'unknown' })).resolves.toBeNull();
	});
});

describe('upsertItem', () => {
	it('creates an item with separate translation rows', async () => {
		const created = await upsertItem({
			price: 75,
			status: 'ACTIVE',
			name: { en: 'Pear', uk: 'Груша' },
			description: { en: 'Green pear' },
		});
		expect(created.id).toBe('4');
		expect(created).toMatchObject({
			price: 75,
			name: { en: 'Pear', uk: 'Груша' },
			description: { en: 'Green pear', uk: '' },
		});
		expect(
			itemTranslationRecords.filter(
				({ itemId }) => itemId === created.id,
			),
		).toHaveLength(2);
	});
	it('updates an existing item and replaces its translations', async () => {
		const updated = await upsertItem({
			id: '1',
			price: 101,
			status: 'ARCHIVED',
			name: { en: 'Red Apple' },
			description: { en: 'Crisp fruit' },
		});
		expect(updated).toMatchObject({
			price: 101,
			status: 'ARCHIVED',
			name: { en: 'Red Apple' },
			description: { en: 'Crisp fruit' },
		});
		expect(updated.name).not.toHaveProperty('uk');
		expect(
			itemTranslationRecords.filter(({ itemId }) => itemId === '1'),
		).toHaveLength(1);
	});
	it('rejects an unknown supplied ID', async () => {
		await expect(
			upsertItem({
				id: 'unknown',
				price: 1,
				status: 'ACTIVE',
				name: {},
				description: {},
			}),
		).rejects.toThrow(Error);
	});
	it('reset restores seed records after mutations', async () => {
		await deleteItem({ id: '1' });
		await upsertItem({
			price: 1,
			status: 'ACTIVE',
			name: {},
			description: {},
		});
		resetItemStore();
		expect(itemRecords.map(({ id }) => id)).toEqual(['1', '2', '3']);
		expect(
			itemTranslationRecords.filter(
				({ itemId, languageId }) =>
					itemId === '2' && languageId === 'uk',
			),
		).toHaveLength(0);
	});
});
