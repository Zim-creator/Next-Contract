export type Language = 'en' | 'uk';
export type ItemStatus = 'ACTIVE' | 'ARCHIVED';
export type Translated<T> = Partial<Record<Language, T>>;

export type ItemRecord = {
	id: string;
	price: number;
	status: ItemStatus;
	createdAt: Date;
	updatedAt: Date;
};

export type ItemTranslationRecord = {
	id: string;
	itemId: string;
	languageId: Language;
	name: string;
	description: string;
};

export type Item = ItemRecord & {
	name: Translated<string>;
	description: Translated<string>;
};

export type PaginatedResult<T> = { count: number; data: T[] };
export type GetItemsInput = {
	language?: Language;
	page?: number;
	perPage?: number;
	sortBy?: 'createdAt' | 'price' | 'name';
	sortOrder?: 'ASC' | 'DESC';
	filters?: { status?: ItemStatus };
};
export type UpsertItemInput = {
	id?: string;
	price: number;
	status: ItemStatus;
	name: Translated<string>;
	description: Translated<string>;
};
