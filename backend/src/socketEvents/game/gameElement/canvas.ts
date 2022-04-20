export const canvas = {
    width : 1400,
    height : 1000,

    widthPercent(point : number) {
        return Number(this.width * point / 100);
    },
    heightPercent(point : number) {
        return Number(this.height * point / 100);
    },
}