import { BadRequestException, HttpStatus, HttpException, Inject, Injectable, CACHE_MANAGER, UnauthorizedException, ConsoleLogger} from '@nestjs/common';
import { getRepository, getCustomRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { Cache } from 'cache-manager';
import { UserRepository, AccountRepository } from 'src/repository/CustomRepository';
import { User } from 'src/entity/CustomEntity'
import { ORIGIN } from 'src/Type/Origin.type';
import { jwtConstants } from 'src/config/jwt.config';
import { JWT_PAYLOAD } from 'src/Type/Payload.type';
import { CreateUserDTO } from 'src/Type/create-user.dto';

@Injectable()
export class AuthService {
 
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService : JwtService){}

  async validataUser(email : string, password : string) {
    const local_user = await getCustomRepository(AccountRepository).findByEmail(email);
    if (!local_user)
      return null;
    if (!await compare(password, local_user.password))
      return null;
    return await getCustomRepository(UserRepository).getIdByEmail(email);
  }

  async createUser(userData : CreateUserDTO){
    // 1. account에 insert (email, password)
    // 2. user에 insert (email, nickname)
     // 3. password 암호화
    const {email, nickname, password} = userData;
    const repo_account = getCustomRepository(AccountRepository);
    const repo_user = getCustomRepository(UserRepository);
    try{
      await repo_user.createUser(email, nickname, ORIGIN.local);
      const encoded_password = this.hashing(password);
      await repo_account.createAccount(email, await encoded_password);
      return {message : "Successfully Created"};
    }
    catch(e){
      throw new HttpException({
        statusCode : HttpStatus.BAD_REQUEST,
        message : e.detail,
    }, HttpStatus.BAD_REQUEST);
    }
  }

  

  async login(user_id : string) {
    //1. login 되어 있는지 확인. login 되어 있으면 다시 안되도록 처리하기 
    //2. 안되어 있으면 login시키기. 
    const user = await this.cacheManager.get(user_id);
    if (user)
      throw new BadRequestException();
    const refresh_token = this.jwtService.sign({expireIn : jwtConstants.refresh_expiresIn});
    const payload = {id : user_id};
    this.cacheManager.set(user_id, refresh_token);
    return {
      message : "Succesfully login",
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
        throw e; //확인필요
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
        throw e; //확인필요
    }
  }

  // 1. verify 했을 떄 유효하지 않으면 null return 인지 throw exception인지 확인 ->error 발생
  // 2. refresh token 한번 더 확인 = cash서버와 ? -> 근데 그러면 value랑 비교했을 때, 만약 그 사이에 유효기간 지나면 판단이 안됨.
  // 3. 없는거 del할때 error인가? error안나면 get하지 않고 del -> 에러 없이 처리 됨.
  async logout(access_token : string) {
    try {
      const user = await this.jwtService.verify(access_token, {ignoreExpiration: true});
      await this.cacheManager.del(user.id);
      return {
        message : "Succesfully Logout",
      }
    }
    catch(e){
      throw new UnauthorizedException();
    }
  }

  async issueAT(access_token : string) {
    try {
      const user = await this.jwtService.verify(access_token, {ignoreExpiration: true});
      const payload = {id : user.id};
      return {
        access_token : this.jwtService.sign(payload),
      };
    }
    catch(e){
      throw new UnauthorizedException();
    }
  }

  // 1. DTO  ( email, nickname, password ) -> password만 받는 걸로
  // 2. cascade (local)
  // 3. oauth 회원탈퇴도 고려. / 회원가입도 고려. -> oauth는 따로 분리할 예정
  async deleteUser( tokenData: JWT_PAYLOAD, password: string){
    try{
    const user = await getRepository(User).findOne(tokenData.id);
    if (!await this.validataUser(user.email, password))
      throw new UnauthorizedException();
    // refersh token 삭제, logout
    this.cacheManager.del(tokenData.id);
    // account_user 삭제
    getCustomRepository(UserRepository).deleteUser(user.email);
    getCustomRepository(AccountRepository).deleteAccount(user.email);
    }
    catch(e)
    {
      throw new HttpException({
        statusCode : HttpStatus.BAD_REQUEST,
        message : e.detail,
    }, HttpStatus.BAD_REQUEST);
    }
  }

  async hashing(password: string) {
    const saltOrRounds = 10; //env
    const encoded_password = await hash(password, saltOrRounds);
    return encoded_password;
  }
}