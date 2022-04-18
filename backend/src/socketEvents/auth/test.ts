export class CHECKER {
    tol = {};
    // on = {};
    off = {};
 
    public online(id, time) {
        
        if (this.off[id]) {
            if (!this.tol[id])
                this.tol[id] = [];
            let diff = time - this.off[id];
            this.tol[id].push(diff);
            this.off[id] = undefined;
        }
        
    };

    public offline(id, time){
       this.off[id] = time;
    };

    public print() {
        console.log("-------------------\n");
        console.log("tot : ", this.tol);
        
        for (let id in this.tol) {
            let sum = 0;
            let max = Math.max.apply(null, this.tol[id]);
            for (let idx in this.tol[id])
                sum += this.tol[id][idx];
            console.log(`${id} > max : ${max},   avg : ${sum / this.tol[id].length}`);
        }
        
        console.log("--------------------\n");
    }

}