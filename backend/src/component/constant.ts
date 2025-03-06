import * as configJson from '../resource/api.json';
import * as swaggerJson from '../resource/swagger.json';

export const ENV = process.env;

export const NODE_ENV = ENV.NODE_ENV;

export const APPLICATION_NAME = 'test';

export const CONFIG = configJson;

export const SWAGGER = swaggerJson;

export const PORT = 8080;
