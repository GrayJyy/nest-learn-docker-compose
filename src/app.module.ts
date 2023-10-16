import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import config from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { createClient } from 'redis';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return {
          host: configService.get('application.db.host'),
          port: configService.get('application.db.port'),
          database: configService.get('application.db.database'),
          username: configService.get('application.db.username'),
          password: configService.get('application.db.password'),
          logging: true,
          type: 'mysql',
          synchronize: true,
          entities: [User],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: { authPlugin: 'sha256_password' },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        return {
          secret: configService.get('application.jwt.secret'),
          signOptions: {
            expiresIn: configService.get('application.jwt.expiresIn'),
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('application.redis.host'),
            port: configService.get('application.redis.port'),
          },
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
}
