import { environment as devEnvironment } from './environment.dev';
import { environment as prodEnvironment } from './environment.prod';

// Definition of ENV_VARIABLES global in webpack.config.ts
declare const ENV_VARIABLES;

export const environment = (() => {
  let envVars;

  if (ENV_VARIABLES.environment) {
    switch (ENV_VARIABLES.environment) {
      case 'prod':
        envVars = prodEnvironment;
        console.log('Environment:', 'PROD');
        break;
      // TODO: Add additional environment (e.g. uat) if required. 
      default:
        envVars = devEnvironment;
        console.log('Environment:', 'DEV');
    }
  } else {
    console.log('Environment:', 'DEV');
    envVars = devEnvironment;
  }

  return envVars;
})();
