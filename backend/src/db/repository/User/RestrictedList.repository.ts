// import { DELAYEDDAY } from "src/config/const";
import { EntityRepository, Repository } from "typeorm";
import { RestrictedList } from "../../entity/User/RestrictedList.entity";
import dotenv from 'dotenv'

const ENV = dotenv.config();

@EntityRepository(RestrictedList)
export class RestrictedListReopsitory extends Repository<RestrictedList> {
    async createList(email : string) {
        const addUser = this.create();
        addUser.email = email;
        const untilday : Date = new Date();
        untilday.setDate(untilday.getDate() + Number(ENV.parsed.DELAYEDDAY));
        addUser.restrictUntil = untilday;
        return addUser;
    }
}