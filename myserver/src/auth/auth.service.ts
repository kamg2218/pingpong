import { Injectable } from '@nestjs/common';
import {getRepository, getCustomRepository} from 'typeorm';
import {User} from 'src/entity/User.entity';
import {Account} from 'src/entity/Account.entity';
import { AccountRepository } from 'src/repository/Account.repository';
import { JwtService } from '@nestjs/jwt';
import {HttpStatus, HttpException} from '@nestjs/common';
import { response } from 'express';
import { UserRepository } from 'src/repository/User.repository';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService : JwtService){

  }
  async validataUser(email : string, password : string) {
        const local_user = await getRepository(Account).findOne({email});
        if (local_user && local_user.password === password)
            return local_user;
        return null;
  }
  async createUser(email, nickname, password){

    // 1. account에 insert (email, nickname)
    // 2. user에 insert (email, password)
    const repo_account = getCustomRepository(AccountRepository);
    const repo_user = getCustomRepository(UserRepository);
    try{
      repo_account.createAccount(email, password);
      repo_user.createUser(email, nickname);
      return {message : "Created"};
    }
    catch(e){
      throw new HttpException({
        statusCode : HttpStatus.BAD_REQUEST,
        message : e.detail,
    }, HttpStatus.BAD_REQUEST);
    }
  }

  async issueAT(user : any) {
    const payload = {id : user.id};
    return {
      access_token : this.jwtService.sign(payload),
    };
  }

  async login(user : any) {
    const payload = { id : user.id }
    const refresh_token = this.jwtService.sign({expireIn : '60m'});
    return {
      access_token : this.jwtService.sign(payload),
      refresh_token,
    }
  }

  async isDuplicateEmail(email : string) {
    const repo = getRepository(User);
    try {
        const user = await repo.findOne({email : email});
        if (user)
            return ({message : true});
        return ({message : false});
    }
    catch(e) {
        console.log("Error : check - email");
        return ({message : false});
    }
  }


  async isDuplicateNickname(nickname : string) {
    const repo = getRepository(User);
    try {
        const user = await repo.findOne({nickname : nickname});
        if (user)
            return ({message : true});
        return ({message : false});
    }
    catch (e) {
        console.log("Error : check - nickname");
        return ({message : false});
    }
  }

  async cleanAllToken(at : string, rt : string) {

  }
}