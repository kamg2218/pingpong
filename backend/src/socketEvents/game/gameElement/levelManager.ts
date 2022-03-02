import { LadderLevel } from "src/type/UserEntity.type";

const level = ["bronze", "silver", "gold", "crystal", "diamond", "master"];
const minLevelPoint = {"bronze" : 0, "silver" : 400, "gold" : 1100, "crystal" : 2100, "diamond" : 3400, "master" : 5000};

export const LevelManager = {
    point : 80,
    bronze : 1,
    silver : 2,
    gold : 3,
    crystal : 4,
    diamond : 5,
    master : 6,

    nextLevelPoint(point : number) {
        const currentLevel = this.level(point);
        if (currentLevel === "master")
            return Infinity;
        const index = level.findIndex(elem=>elem===currentLevel) + 1;
        const nextLevel = level[index];
        return minLevelPoint[nextLevel] - point;
    },

    //speed에 따라 추가 점수 부여?
    getPoint(winner : LadderLevel, loser : LadderLevel, speed : number) {
        let diffLevel = this[winner] / this[loser];
        let speedAd = (9 + speed) / 10;
        let pwinner = this.point / diffLevel * speedAd;
        let ploser  = -1 * this.point / diffLevel / speedAd;
        return {pwinner, ploser}
    },
    
    range(value : number, min : number, max : number) {
        if (value >= min && value < max)
            return true;
        return false;
    },

    level(point : number) {
        if (this.range(point, 0, 400))
            return "bronze";
        else if (this.range(point, 400, 1100))
            return "silver";
        else if (this.range(point, 1100, 2100))
            return "gold";
        else if (this.range(point, 2100, 3400))
            return "crystal";
        else if (this.range(point, 3400, 5000))
            return "diamond";
        else if (this.range(point, 5000, Infinity))
            return "master";
    }
}