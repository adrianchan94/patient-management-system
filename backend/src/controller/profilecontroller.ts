import { Request, Response } from 'express';
import { getManager, getRepository } from 'typeorm';
import { logger } from '../component/logger';
import { Organisation } from '../entity/organisation';
import { Profile } from '../entity/profile';

export const profileController = new class {

    getProfile = async (request: Request, response: Response) => {
        request.checkParams('org', 'org is not valid').isUUID();
        request.checkParams('profileId', 'profileId is not valid').isUUID();
        const errors = request.validationErrors();
        if (errors) {
            response.status(400).json(errors);
            return;
        }

        const { org, profileId } = request.params;
        try {
            const profile = await getManager()
                .createQueryBuilder()
                .select('profile')
                .from(Profile, 'profile')
                .innerJoin(
                    'profile.organisation',
                    'organisation',
                    'organisation.organisationId = :organisationId',
                    {
                        organisationId: org,
                    }
                )
                .where(
                    'profile.profileId = :profileId',
                    {
                        profileId,
                    }
                )
                .getOne();
            if (profile) {
                const { name, profileId: id, } = profile;
                response.status(200).json({
                    data: {
                        id,
                        type: 'profile',
                        attributes: {
                            name,
                        },
                    },
                });
            } else {
                response.status(404).json({ msg: 'Result not found' });
            }
        } catch (err) {
            logger.error(err.message);
            response.status(500).json({ msg: 'Something went wrong' });
        }
    }

    createProfile = async (request: Request, response: Response) => {
        request.checkParams('org', 'org is not valid').isUUID();
        request.checkBody('data.type', 'type is not valid').equals('profile');
        request.checkBody('data.attributes.name', 'name is not valid').notEmpty();
        const errors = request.validationErrors();
        if (errors) {
            response.status(400).json(errors);
            return;
        }

        try {
            const { org, } = request.params;
            const organisation = await getManager()
                .createQueryBuilder()
                .select('organisation')
                .from(Organisation, 'organisation')
                .where(
                    'organisation.organisationId = :organisationId',
                    {
                        organisationId: org,
                    }
                )
                .getOne();
            if (!organisation) {
                response.status(404).json({ msg: 'Org not found' });
                return;
            }
            const { name, } = request.body.data.attributes;
            const repo = getRepository(Profile);
            const profile = await repo.save(repo.create({
                name,
                organisation,
            }));
            const { profileId: id, } = profile;
            response.status(201).json({
                data: {
                    id,
                    type: 'profile',
                    attributes: {
                        name,
                    },
                },
            });
        } catch (err) {
            logger.error(err.message);
            response.status(500).json({ msg: 'Something went wrong' });
        }
    }

};
