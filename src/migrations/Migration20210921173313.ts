import { Migration } from '@mikro-orm/migrations';

export class Migration20210921173313 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "name" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
  }

}
