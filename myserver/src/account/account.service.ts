
import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/User.entity';
import {getRepository} from 'typeorm';
import {HttpStatus, HttpException} from '@nestjs/common';

@Injectable()
export class AccountService {

    async create(email :string, nickname : string, password : string){
        console.log("CREATED");
        const repo = getRepository(User);
        const user = new User();
        user.email = email;
        user.nickname = nickname;
        user.password = password;

        try {
            await repo.insert(user);
            return {message : "Created"}
        }
        catch(e) {
            console.log("Error : create");
            //console.log(e);
            throw new HttpException({
                statusCode : HttpStatus.BAD_REQUEST,
                message : e.detail,
            }, HttpStatus.BAD_REQUEST);
        }
    }

    async signIn(email : string, password : string) {
        const repo = getRepository(User);
        const user = await repo.findOne(email);
        if (!user){
            throw new HttpException({
                statusCode : HttpStatus.BAD_REQUEST,
                message : "No user with {email} = " + email,
            }, HttpStatus.BAD_REQUEST);
        }
        if (user.password !== password)
        {
            throw new HttpException({
                statusCode : HttpStatus.UNAUTHORIZED,
                message : "Wrong password",
            }, HttpStatus.UNAUTHORIZED);
        }
        
        return {
            message : "Success sign in"
        };
    }

    async isDuplicateEmail(email : string) {
        console.log("check email");
        const repo = getRepository(User);
        try {
            const user = await repo.findOne(email);
            if (user)
            {
                console.log("there is email : " + user);
                return (true);
            }
            return (false);
        }
        catch(e) {
            console.log("Error : check - email");
            //console.log(e);
            return (false);
        }
    }

    async isDuplicateNickname(nickname : string) {
        console.log("check nick");
        const repo = getRepository(User);
        try {
            const user = await repo.findOne({nickname : nickname});
            if (user)
            {   
                console.log("there is nickname : " + user);
                return (true);
            }
            return (false);
        }
        catch (e) {
            console.log("Error : check - nickname");
            //console.log(e);
            return (false);
        }
    }

    async validateUser(){

    }
}
