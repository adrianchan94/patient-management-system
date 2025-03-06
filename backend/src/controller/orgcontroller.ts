import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { logger } from '../component/logger';
import { Organisation } from '../entity/organisation';

export const orgController = new class {

    getOrgs = async (request: Request, response: Response) => {
        try {
            const orgs = await getRepository(Organisation).find();
            response.status(200).json({
                data: orgs.map(({ organisationId: id, name, }) => ({
                    id,
                    type: 'organisation',
                    attributes: {
                        name,
                    },
                })),
            });
        } catch (err) {
            logger.error(err.message);
            response.status(500).json({ msg: 'Something went wrong' });
        }
    }

};
