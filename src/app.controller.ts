import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  @Get()
  async getHello() {
    const keys = await this.redisClient.keys('*');
    console.log(keys);
    return this.appService.getHello();
  }
}
