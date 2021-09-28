import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entity/User.entity';
import { ORIGIN } from 'src/Type/Origin.type';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    static deleteUser(email: string) {
      throw new Error('Method not implemented.');
    }
    
    async findByEmail(email : string){
        return await this.findOne({email : email});
    }
    async findByNickname(nickname : string) {
        return await this.findOne({nickname : nickname});
    }

    async getIdByNickname(nickname : string)  {
        return (await this.findOne({nickname : nickname})).id;
    }

    async getIdByEmail(email : string) {
        return (await this.findOne({email : email})).id;
    }
    
    async createUser(email : string, nickname : string, origin_type : ORIGIN) {
        const user = this.create();
        user.email = email;
        user.nickname = nickname;
        user.origin = origin_type;
        await this.insert(user);
    }

    async deleteUser(email : string) : Promise<void> {
        await this.delete({email : email});
    }
}