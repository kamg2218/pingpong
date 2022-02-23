import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { User } from "src/db/entity/User/UserEntity";
import { UserRepository } from "src/db/repository/User/User.repository";
import { UserDeco } from "src/type/user.decorator";
import { getCustomRepository } from "typeorm";
import { UserService } from "./user.service";

@Controller('user')

export class UserController {
    constructor(
        private readonly userService : UserService, 
    ) {}

    @Get('/check')
    @UseGuards(AuthGuard('jwt'))
    // async checkState(@Res({passthrough : true}) res : Response) {
    async checkState(@Res({passthrough : true}) res : Response, @UserDeco() user: User) {
        // const user = await getCustomRepository(UserRepository).findOne({nickname : "nahkim"});
        const state = await this.userService.findState(user);
        res.send(state);
    }
}