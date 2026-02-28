import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterUserDTO {
    @ApiProperty({ example: "any" })
    @IsString()
    userName: string;
    
    @ApiProperty({ example: "any@gmail.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "anypass1234" })
    @MinLength(6)
    password: string;
}

export class LoginDTO {
    @ApiProperty({ example: "any@gmail.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "anypass1234" })
    @MinLength(6)
    password: string;
}