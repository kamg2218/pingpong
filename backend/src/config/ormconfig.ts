import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import dotenv from 'dotenv'
const ENV = dotenv.config();

export const ormconfig : TypeOrmModuleOptions= {
   "type": "postgres",
   "host": ENV.parsed.DB_HOST,
   "port": Number(ENV.parsed.DB_PORT),
   "username": ENV.parsed.DB_USER_NAME,
   "password": ENV.parsed.DB_PASSWORD,
   "database": ENV.parsed.DB_NAME,
   "synchronize": true,
   "logging" : false,
   "dropSchema" : true, //나중에는 지우기
   "entities": [ __dirname + "/../db/entity/**/*.entity.{js,ts}" ],
}