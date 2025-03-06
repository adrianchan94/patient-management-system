import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOrganisation1628176883277 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO test.organisation (name) VALUES ('Prenetics');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
