import os from 'os';
import config from '../config/app.config';

interface SystemHealth {
  cpuUsage: number[];
  totalMemory: string;
  freeMemory: string;
}

interface ApplicationHealth {
  environment: string;
  uptime: string;
  memoryUsage: {
    heapTotal: string;
    heapUsed: string;
  };
}

export default {
  getSystemHealth: (): SystemHealth => {
    return {
      cpuUsage: os.loadavg(),
      totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
      freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
    };
  },
  getApplicationHealth: (): ApplicationHealth => {
    return {
      environment: config.ENV,
      uptime: `${process.uptime().toFixed(2)} Second`,
      memoryUsage: {
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
      }
    };
  }
};
