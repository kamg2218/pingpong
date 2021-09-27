import {TypeOrmModuleOptions} from '@nestjs/typeorm';

export const ormconfig : TypeOrmModuleOptions= {
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": "postgres",
   "password": "0000",
   "database": "user",
   "synchronize": true,
   "logging": false,
   "entities": [ __dirname + "/entity/**/*.entity.{js,ts}" ]
}