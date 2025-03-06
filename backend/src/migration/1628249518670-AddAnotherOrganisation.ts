import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAnotherOrganisation1628249518670 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO test.organisation (name) VALUES ('Circle');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
