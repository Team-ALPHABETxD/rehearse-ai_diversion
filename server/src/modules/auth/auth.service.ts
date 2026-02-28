import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO, RegisterUserDTO } from './auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    // add all userservices as props to auth service
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async registerSevice (regDto: RegisterUserDTO) {
        const hash = await bcrypt.hash(regDto.password, 10)

        const oldUser = await this.userService.findUserByEmail(regDto.email)
        if(oldUser) return new BadRequestException("User in this email already exists.")

        const newUser = await this.userService.createUser({...regDto, password: hash})
        if(!newUser) return new ServiceUnavailableException("Something went wrong.")

        const payload = {
            userId: newUser._id
        }

        const token = await this.jwtService.signAsync(payload)
        regDto['token'] = token
        return { flag: "succes", data: regDto }
    }

    async loginService (loginDto: LoginDTO) {
        const user = await this.userService.findUserByEmail(loginDto.email)
        if(!user) return new NotFoundException('User in this email does not exist.')
        
        const passHash = user.password
        const isOk = await bcrypt.compare(loginDto.password, passHash)
        if(!isOk) return new UnauthorizedException("Please check your credentials and try again.")

        const payload = { userId: user._id }
        const token = await this.jwtService.signAsync(payload)
        loginDto['token'] = token
        return { flag: "succes", data: loginDto }
    }
}