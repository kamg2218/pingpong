import { GameHistory } from "src/db/entity/Game/GameEntity";
import { User } from "src/db/entity/User/UserEntity";
import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { UserRepository } from "../User/User.repository";

@EntityRepository(GameHistory)
export class GameHistoryRepository extends Repository<GameHistory> {

    public async getAllHistories(me : User) {
        let res = [];
        const repo_user = getCustomRepository(UserRepository);

        //order 고려해야함. 과거 먼저? 최근먼저? 
        const list = await this.find({where : [{player1 : me}, {player2 : me}], order : {startTime : 'ASC'}}); 
        list.map((elem)=>{
            let player1 = {score : elem.scoreP1, ...repo_user.getSimpleInfo(elem.player1)};
            let player2 = {score : elem.scoreP2, ...repo_user.getSimpleInfo(elem.player2)};
            let winner = elem.winner.userid;
            if (elem.player1.userid === me.userid)
                res.push({me : player1, theOther : player2, winner : winner});
            else
                res.push({me : player2, theOther : player1, winner : winner});
       });
       return res;
    }

    public async saveHistory(player1 : User, player2 : User, winner : User, score1 : number, score2 : number, startTime : Date, endTime : Date) {
        const history = this.create();
        history.player1 = player1;
        history.player2 = player2;
        history.scoreP1 = score1;
        history.scoreP2 = score2;
        history.startTime = startTime;
        history.winner = winner;
        history.playTimeSec = (endTime.getTime() - startTime.getTime()) / 1000;
        await this.insert(history);
    }
}
    