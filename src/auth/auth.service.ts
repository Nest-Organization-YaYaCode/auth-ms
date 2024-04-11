import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dtos';
import * as bcryp from 'bcrypt'
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jtwpayload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit{
    onModuleInit() {
        this.$connect();
        Logger.log('Connected to database', 'AuthService');
    }

    constructor(
        private jwtService: JwtService
    ){
        super();
    }

    async signJwt( payload: JwtPayload ){
        return this.jwtService.sign(payload);
    }

    async verifyToken(token){
        try {
            
            const payload = this.jwtService.verify(token, {
                secret: envs.JWT_SECRET
            });

            const { sub, iat, exp, ...user } = payload;

            return {
                user: user,
                token: await this.signJwt(user)
            }

        } catch (error) {

            throw new RpcException({message: 'Invalid token', status: 401})
            
        }
    }

    async registerUser(registerUserDto: RegisterUserDto){
        const { name, email, password } = registerUserDto;

        try {

            const user = await this.user.findUnique({
                where: { email }
            })

            if(user){
                throw new RpcException({message: 'User already exists', status: 400})
            }

            const newUser = await this.user.create({
                data: {
                    name,
                    email,
                    password: bcryp.hashSync(password, 10)
                }
            })

            const {password: __, ...rest} = newUser;

            return {
                user: rest,
                token: await this.signJwt( rest )
            };
            
        } catch (error) {
            throw new RpcException({message: error.message, status: 400})
        }
    }
        
    async loginUser( loginUserDto: LoginUserDto ){

        const { email, password } = loginUserDto;

        try {

            const user = await this.user.findUnique({
                where: { email }
            })

            if(!user){
                throw new RpcException({message: 'Invalid credentials', status: 401})
            }

            const isPasswordValid = bcryp.compareSync(password, user.password);

            if(!isPasswordValid){
                throw new RpcException({message: 'Invalid credentials', status: 401})
            }

            const {password: __, ...rest} = user;

            return {
                user: rest,
                token: await this.signJwt( rest )
            };
            
        } catch (error) {
            throw new RpcException({message: error.message, status: error.status || 401})
        }
        
    }

}
