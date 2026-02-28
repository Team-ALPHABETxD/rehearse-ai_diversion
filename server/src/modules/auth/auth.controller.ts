import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterUserDTO } from './auth.dto';
import { ApiBody, ApiHeaders, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth') // all routes of this module will work at 'backend_endpoint/auth/...' 
export class AuthController {
    // add all the authservices as props to the controller
    constructor(private readonly authService: AuthService) {}

    @Post ('register') // post req to 'backend_endpoint/auth/register'
    @ApiBody({ type: RegisterUserDTO })
    @ApiOperation({ description: "New user registration" })
    @ApiHeaders([])
    async register(@Body() RegDto: RegisterUserDTO) {
        console.log(RegDto)
        return await this.authService.registerSevice(RegDto)
    }

    @Post ('login') 
    @ApiBody({ type: LoginDTO })
    @ApiOperation({ description: "Existed user login" })
    async login (@Body() loginDto: LoginDTO) {
        return await this.authService.loginService(loginDto)
    }
}