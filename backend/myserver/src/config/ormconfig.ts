import {TypeOrmModuleOptions} from '@nestjs/typeorm';

export const ormconfig : TypeOrmModuleOptions= {
   "type": "postgres",
   "host": "192.168.0.19",
   "port": 5432,
   "username": "postgres",
   "password": "12345",
   "database": "my-service",
   "synchronize": true,
   "logging" : false,
   "dropSchema" : true, //나중에는 지우기
   "entities": [ __dirname + "/../db/entity/**/*.entity.{js,ts}" ]
}
