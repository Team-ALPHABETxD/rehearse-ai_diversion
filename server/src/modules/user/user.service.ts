import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterUserDTO } from '../auth/auth.dto';


@Injectable()
export class UserService {
    // user model injection as prop
    constructor(@InjectModel(User.name) private userModel : Model<User>) {}

    async createUser (regDto: RegisterUserDTO) {
        try {
            const createdUser = await this.userModel.create(regDto)
            return createdUser   
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserByEmail (email: string) {
        try {
            const user = await this.userModel.findOne({email: email})
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserById (id: any) {
        try {
            const user = await this.userModel.findById(id)
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
