import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTables1628176873048 implements MigrationInterface {
    name = 'AddTables1628176873048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "test"."result" ("resultid" uuid NOT NULL DEFAULT uuid_generate_v4(), "activationtime" TIMESTAMP NOT NULL DEFAULT now(), "activatedby" text, "sampleid" text NOT NULL, "resultTime" TIMESTAMP NOT NULL DEFAULT now(), "result" jsonb, "type" text NOT NULL DEFAULT 'rtpcr', "profileProfileId" uuid, CONSTRAINT "PK_89263399e8916df2433096569f0" PRIMARY KEY ("resultid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d3fca82fd5cec7fde77da14fa8" ON "test"."result" ("sampleid") `);
        await queryRunner.query(`CREATE TABLE "test"."profile" ("profileid" uuid NOT NULL DEFAULT uuid_generate_v4(), "datetime" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "organisationOrganisationId" uuid, CONSTRAINT "PK_d5057b796d3765e4091d1b48193" PRIMARY KEY ("profileid"))`);
        await queryRunner.query(`CREATE TABLE "test"."organisation" ("organisationid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "datetime" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57b8038304edebf1cb21171238c" PRIMARY KEY ("organisationid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cbef1604de70b0abea2a25479e" ON "test"."organisation" ("name") `);
        await queryRunner.query(`ALTER TABLE "test"."result" ADD CONSTRAINT "FK_996b509dd625f1a23349d854dc3" FOREIGN KEY ("profileProfileId") REFERENCES "test"."profile"("profileid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test"."profile" ADD CONSTRAINT "FK_4a9f2e076716fa6b504817b3d40" FOREIGN KEY ("organisationOrganisationId") REFERENCES "test"."organisation"("organisationid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test"."profile" DROP CONSTRAINT "FK_4a9f2e076716fa6b504817b3d40"`);
        await queryRunner.query(`ALTER TABLE "test"."result" DROP CONSTRAINT "FK_996b509dd625f1a23349d854dc3"`);
        await queryRunner.query(`DROP INDEX "test"."IDX_cbef1604de70b0abea2a25479e"`);
        await queryRunner.query(`DROP TABLE "test"."organisation"`);
        await queryRunner.query(`DROP TABLE "test"."profile"`);
        await queryRunner.query(`DROP INDEX "test"."IDX_d3fca82fd5cec7fde77da14fa8"`);
        await queryRunner.query(`DROP TABLE "test"."result"`);
    }

}
