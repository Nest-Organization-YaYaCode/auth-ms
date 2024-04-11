import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Min, MinLength } from "class-validator";



export class RegisterUserDto {

    @IsString()
    @IsEmail()
    email: string;
    
    @IsString()
    @IsStrongPassword()
    password: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;
    

}