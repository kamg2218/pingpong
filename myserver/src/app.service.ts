import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}