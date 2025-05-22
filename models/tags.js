import { Model } from 'objection';

export class Tags extends Model {
  static get tableName() {
    return 'tags';
  }

  static get idColumn() {
    return 'id'; // primary key column
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: ['integer'] },
        tag_name: { type: ['string'] },
        tag_code: { type: ['string'] },
        tag_value: { type: ['string'] },
        created_on: { type: ['string'] },
        created_at: { type: ['string'] },
        updated_at: { type: ['string'] }
      }
    };
  }
}
