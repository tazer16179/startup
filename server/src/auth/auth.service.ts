import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcryptjs"
import { User } from 'src/users/users.model';
@Injectable()
export class AuthService {
constructor(private userService: UsersService, private jwtService:JwtService){}    

   async login( userDto: CreateDto){
    const user = await this.validateUser(userDto)
    return this.generateToken(user)
    }

    async registration(userDto: CreateDto){
        const cnadidate = await this.userService.getUsersByEmail(userDto.email);
        if (cnadidate) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST)
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({...userDto, password:hashPassword})
        return this.generateToken(user)
    }
    private async  generateToken(user:User){
        const payload = {email: user.email, id:user.id, roles:user.roles}
        return {
             token: this.jwtService.sign(payload)
              }
    }
    async validateUser (userDto: CreateDto){
        const user = await this.userService.getUsersByEmail(userDto.email);
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals){
            return user;
        }
        throw new UnauthorizedException({message: 'Некоректный email или пароль'})
    }
    async check(user:User){
       
        const token = this.generateToken(user)
        return  token;
    }

}
