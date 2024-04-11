

import 'dotenv/config';
import * as joi from 'joi';

interface IEnv {
    PORT: number;
    NATS_SERVICES_URL: string[];
    JWT_SECRET: string;
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVICES_URL: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required()
}).unknown(true);

const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVICES_URL: process.env.NATS_SERVICES_URL?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envsVars: IEnv = value;

export const envs = {
    PORT: envsVars.PORT,
    NATS_SERVICES_URL: envsVars.NATS_SERVICES_URL,
    JWT_SECRET: envsVars.JWT_SECRET
}
