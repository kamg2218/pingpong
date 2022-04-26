import { Module } from '@nestjs/common';
import { AuthModule } from 'src/restRequests/auth/auth.module';
import { AuthGateway } from './auth/auth.gateway';
import { ChatGateway } from './chat/chat.gateway';
import { GameGateway } from './game/game.gateway';
import { GameGatewayService } from './game/gameGateway.service';
import { UserGateway } from './user/user.gateway';
import { UserGatewayService } from './user/userGateway.service';
import { ChatGatewayService } from './chat/chatGateway.service';

@Module({
    imports : [AuthModule],
    providers: [AuthGateway, ChatGateway, UserGateway, GameGateway, UserGatewayService, ChatGatewayService, GameGatewayService],
    exports: [ChatGateway, UserGateway, GameGateway]
})
export class EventsModule {}
