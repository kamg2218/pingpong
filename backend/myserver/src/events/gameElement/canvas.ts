export const canvas = {
    width : 1400,
    height : 1000,

    widthPercent(point : number) {
        return this.width * point / 100;
    },
    heightPercent(point : number) {
        return this.height * point / 100;
    },
}