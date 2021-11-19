import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { jwtConstants } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { getCustomRepository, getRepository } from 'typeorm';
import { SignUpDTO } from 'src/type/signup.dto';
import { UserRepository } from 'src/db/repository/CustomRepository';
import { User, WaitingSignup , Token } from 'src/db/entity/User/UserEntity';

@Injectable()
export class AuthService {

  constructor(private readonly jwtService : JwtService) {
  }

  async searchEmail(emailid : string) {
      if (emailid === undefined)
            return null;
        const repo_signup = getRepository(WaitingSignup);
        const signup = await repo_signup.findOne(emailid);
        if (signup === undefined)
            return null;
        return signup.email;
  }

  async createUser(email : string, data : SignUpDTO) {
    const repo_user = getCustomRepository(UserRepository);
    const repo_waitinglist = getRepository(WaitingSignup);
    const user = repo_user.create();
    user.email = email
    user.nickname = data.nickname
    user.profile = data.profile
    await repo_user.insert(user);
    repo_waitinglist.delete({email : email});
  }

  async login(user : User) {
    const atExpireIn = jwtConstants.getByms('at')
    const rtExpireIn = jwtConstants.getByms('rt')
    return {
      'atExpireIn' : atExpireIn,
      'rtExpireIn' : rtExpireIn,
      'accessToken' : await this.issueACToken(user),
      'refreshToken' : await this.issueRFToken(user, rtExpireIn),
    }
  }

  async logout(user : User) {
    const repo_token = getRepository(Token)
    const token = await repo_token.findOne({user : user})
    repo_token.remove(token);
  }

  async issueACToken(user : User) {
    const payload = {userid : user.userid};
    const token = this.jwtService.sign(payload);
    return token;
  }

  async issueRFToken(user : User, rtExpireIn : number) {
    const repo_token = getRepository(Token)
    const token_entity = repo_token.create();
    const token = this.jwtService.sign({expirIn : rtExpireIn});
    try {
      token_entity.refreshToken = token;
      token_entity.user = user;
      await repo_token.save(token_entity);
      return token;
    }
    catch (e) {
      throw new BadRequestException()
    }
  }

  async hashing(password: string) {
    const saltOrRounds = 10; //env
    const encoded_password = await hash(password, saltOrRounds);
    return encoded_password;
  }
}