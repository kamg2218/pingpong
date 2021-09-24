import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entity/User.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findByEmail(email : string){
        return await this.findOne({email : email});
    }
    async findByNickname(nickname : string) {
        return await this.findOne({nickname : nickname});
    }

    async getIdByNickname(nickname : string)  {
        return (await this.findOne({nickname : nickname})).id;
    }
    
    async createUser(email : string, nickname : string) {
        const user = this.create();
        user.email = email;
        user.nickname = nickname;
        await this.insert(user);
    }
}