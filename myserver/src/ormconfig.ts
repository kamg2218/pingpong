import {TypeOrmModuleOptions} from '@nestjs/typeorm';

export const ormconfig : TypeOrmModuleOptions= {
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": "postgres",
   "password": "12345",
   "database": "my-service",
   "synchronize": true,
   "logging": true,
   "entities": [ __dirname + "/entity/**/*.entity.{js,ts}" ]
}