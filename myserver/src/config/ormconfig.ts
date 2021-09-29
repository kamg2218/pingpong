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
   dropSchema : true,
   "entities": [ __dirname + "/../entity/**/*.entity.{js,ts}" ]
}
