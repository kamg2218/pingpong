import {EntityRepository, Repository} from 'typeorm';
import { Account } from 'src/entity/Account.entity';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {
    static deleteUser(email: string) {
      throw new Error('Method not implemented.');
    }
    async findByEmail(email : string){
        return await this.findOne(email);
    }

    async createAccount(email : string, password : string) {
        const account = this.create();
        account.email = email;
        account.password = password;
        await this.insert(account);
    }

    async deleteUser(email :string) : Promise<void>{
        await this.delete({email : email});
    }
}