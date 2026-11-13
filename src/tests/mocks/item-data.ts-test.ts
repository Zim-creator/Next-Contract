import {
	type ItemRecord,
	type ItemTranslationRecord,
} from '../backend/item-types.ts-test';

export const seedItems: ItemRecord[] = [
	{
		id: '1',
		price: 100,
		status: 'ACTIVE',
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-02T00:00:00.000Z'),
	},
	{
		id: '2',
		price: 50,
		status: 'ACTIVE',
		createdAt: new Date('2024-01-02T00:00:00.000Z'),
		updatedAt: new Date('2024-01-03T00:00:00.000Z'),
	},
	{
		id: '3',
		price: 200,
		status: 'ARCHIVED',
		createdAt: new Date('2024-01-03T00:00:00.000Z'),
		updatedAt: new Date('2024-01-04T00:00:00.000Z'),
	},
];

export const seedItemTranslations: ItemTranslationRecord[] = [
	{
		id: '1-en',
		itemId: '1',
		languageId: 'en',
		name: 'Apple',
		description: 'A crisp red apple.',
	},
	{
		id: '1-uk',
		itemId: '1',
		languageId: 'uk',
		name: 'Яблуко',
		description: 'Соковите червоне яблуко.',
	},
	{
		id: '2-en',
		itemId: '2',
		languageId: 'en',
		name: 'Banana',
		description: 'A ripe yellow banana.',
	},
	{
		id: '3-en',
		itemId: '3',
		languageId: 'en',
		name: 'Orange',
		description: 'A sweet orange fruit.',
	},
	{
		id: '3-uk',
		itemId: '3',
		languageId: 'uk',
		name: 'Апельсин',
		description: 'Солодкий апельсин.',
	},
];
