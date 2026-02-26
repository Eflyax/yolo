import type {EReferenceType} from '../enums';

export interface IReference {
	type: EReferenceType
	name: string
	id: string
	hash: string
}
