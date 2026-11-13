import {
	allocateItemId,
	getMutationDate,
	itemRecords,
	itemTranslationRecords,
	replaceItemTranslations,
} from '../mocks/item-store.ts-test';
import { mockResponse } from '../mocks/mock-response.ts-test';
import {
	type GetItemsInput,
	type Item,
	type ItemRecord,
	type ItemTranslationRecord,
	type Language,
	type PaginatedResult,
	type UpsertItemInput,
} from './item-types.ts-test';

function projectItem(record: ItemRecord, language?: Language): Item {
	const translations = itemTranslationRecords.filter(
		(translation) =>
			translation.itemId === record.id &&
			(!language || translation.languageId === language),
	);

	const name: Item['name'] = {};
	const description: Item['description'] = {};

	for (const translation of translations) {
		name[translation.languageId] = translation.name;
		description[translation.languageId] = translation.description;
	}
	return {
		...record,
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
		name,
		description,
	};
}

export async function getItem(input: {
	id: string;
	language?: Language;
}): Promise<Item | null> {
	const record = itemRecords.find(({ id }) => id === input.id);
	return mockResponse(record ? projectItem(record, input.language) : null);
}

export async function getItems(
	input: GetItemsInput = {},
): Promise<PaginatedResult<Item>> {
	const {
		page = 1,
		perPage = 20,
		sortBy = 'createdAt',
		sortOrder = 'DESC',
		language,
	} = input;
	const direction = sortOrder === 'ASC' ? 1 : -1;
	const matching = itemRecords.filter(
		(item) =>
			!input.filters?.status || item.status === input.filters.status,
	);
	matching.sort((a, b) => {
		let comparison = 0;
		if (sortBy === 'name') {
			const aName = itemTranslationRecords.find(
				(row) =>
					row.itemId === a.id &&
					row.languageId === (language ?? 'en'),
			)?.name;
			const bName = itemTranslationRecords.find(
				(row) =>
					row.itemId === b.id &&
					row.languageId === (language ?? 'en'),
			)?.name;
			if (aName === undefined || bName === undefined)
				comparison = aName === bName ? 0 : aName === undefined ? 1 : -1;
			else
				comparison =
					aName
						.toLocaleLowerCase()
						.localeCompare(bName.toLocaleLowerCase()) * direction;
		} else if (sortBy === 'price')
			comparison = (a.price - b.price) * direction;
		else
			comparison =
				(a.createdAt.getTime() - b.createdAt.getTime()) * direction;
		return comparison || a.id.localeCompare(b.id);
	});
	const start = (page - 1) * perPage;
	return mockResponse({
		count: matching.length,
		data: matching
			.slice(start, start + perPage)
			.map((item) => projectItem(item, language)),
	});
}

export async function deleteItem(input: { id: string }): Promise<Item | null> {
	const index = itemRecords.findIndex(({ id }) => id === input.id);
	if (index < 0) return null;
	const record = itemRecords[index];
	if (!record) return null;
	const deleted = projectItem(record);
	itemRecords.splice(index, 1);
	for (let i = itemTranslationRecords.length - 1; i >= 0; i -= 1) {
		if (itemTranslationRecords[i]?.itemId === input.id)
			itemTranslationRecords.splice(i, 1);
	}
	return mockResponse(deleted);
}

export async function upsertItem(input: UpsertItemInput): Promise<Item> {
	let record: ItemRecord;
	if (input.id !== undefined) {
		const existing = itemRecords.find(({ id }) => id === input.id);
		if (!existing) throw new Error(`Item ${input.id} does not exist`);
		record = existing;
		record.price = input.price;
		record.status = input.status;
		record.updatedAt = getMutationDate();
	} else {
		const id = allocateItemId();
		record = {
			id,
			price: input.price,
			status: input.status,
			createdAt: getMutationDate(),
			updatedAt: getMutationDate(),
		};
		itemRecords.push(record);
	}
	const languages: Language[] = ['en', 'uk'];
	const translations: ItemTranslationRecord[] = [];
	for (const language of languages) {
		const name = input.name[language];
		const description = input.description[language];
		if (name !== undefined || description !== undefined) {
			translations.push({
				id: `${record.id}-${language}`,
				itemId: record.id,
				languageId: language,
				name: name ?? '',
				description: description ?? '',
			});
		}
	}
	replaceItemTranslations(record.id, translations);
	return mockResponse(projectItem(record));
}
