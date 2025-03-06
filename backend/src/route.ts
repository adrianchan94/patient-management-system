import { APPLICATION_NAME } from './component/constant';
import { orgController } from './controller/orgcontroller';
import { profileController } from './controller/profilecontroller';
import { resultController } from './controller/resultcontroller';
import { swaggerController } from './controller/swaggercontroller';

const versionPath = `/${APPLICATION_NAME}/v1.0`;
export const routes = [
    {
        method: 'get',
        route: `${versionPath}/swagger`,
        main: swaggerController.getSwagger,
    },
    {
        method: 'get',
        route: `${versionPath}/org`,
        main: orgController.getOrgs,
    },
    {
        method: 'get',
        route: `${versionPath}/org/:org/profile/:profileId`,
        main: profileController.getProfile,
    },
    {
        method: 'post',
        route: `${versionPath}/org/:org/profile`,
        main: profileController.createProfile,
    },
    {
        method: 'get',
        route: `${versionPath}/org/:org/sample`,
        main: resultController.getResults,
    },
    {
        method: 'get',
        route: `${versionPath}/org/:org/profile/:profileId/sample/:sampleId`,
        main: resultController.getProfileResult,
    },
    {
        method: 'post',
        route: `${versionPath}/org/:org/profile/:profileId/sample`,
        main: resultController.addResult,
    },
];
