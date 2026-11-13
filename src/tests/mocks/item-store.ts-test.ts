import {
	type ItemRecord,
	type ItemTranslationRecord,
} from '../backend/item-types.ts-test';
import { seedItems, seedItemTranslations } from './item-data.ts-test';

export let itemRecords: ItemRecord[] = [];
export let itemTranslationRecords: ItemTranslationRecord[] = [];
export let nextItemId = 4;
export let mutationTimestamp = 0;

export function resetItemStore(): void {
	itemRecords = seedItems.map((record) => ({
		...record,
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
	}));
	itemTranslationRecords = seedItemTranslations.map((record) => ({
		...record,
	}));
	nextItemId = 4;
	mutationTimestamp = 0;
}

export function getMutationDate(): Date {
	mutationTimestamp += 1;
	return new Date(Date.UTC(2025, 0, 1, 0, 0, mutationTimestamp));
}

export function allocateItemId(): string {
	const id = String(nextItemId);
	nextItemId += 1;
	return id;
}

export function replaceItemTranslations(
	itemId: string,
	translations: ItemTranslationRecord[],
): void {
	itemTranslationRecords = itemTranslationRecords.filter(
		({ itemId: currentId }) => currentId !== itemId,
	);
	itemTranslationRecords.push(...translations);
}

resetItemStore();
