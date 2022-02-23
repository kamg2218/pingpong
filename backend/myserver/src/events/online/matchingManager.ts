import { Queue } from "../gameElement/queue";

const waitingMatchingList = new Queue();

export const MatchingManager = {
    isThereWaitingUser() : boolean {
        if (waitingMatchingList.size())
            return true;
        return false;
    },

    getOne() : string {
        return waitingMatchingList.pop();
    },

    putOnTheWaitingList(userid : string) {
        waitingMatchingList.push(userid);
    },

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    generateGameRoomOptions() {
        let title = "random" + this.getRandomInt(0, 10000);
        return {
            title,
            type : "public",
            speed : 1
        };
    },

    cancle(userid : string) {
        waitingMatchingList.delete(userid);
    },

    print(){
        console.log("waiting list : ", waitingMatchingList)
    }
};