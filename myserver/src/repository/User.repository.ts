import {EntityRepository, Repository} from 'typeorm';
import {User} from '../entity/User.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findByEmail(email : string){
        return this.findOne({email : email});
    }
    findByNickname(nickname : string) {
        return this.findOne({nickname : nickname});
    }
    createUser(email : string, nickname : string, password : string) {
        const user = this.create();
        user.email = email;
        user.nickname = nickname;
        user.password = password;
        this.save(user);
    }
}