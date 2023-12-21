import { SSTConfig } from 'sst';
import { App } from 'sst/constructs';
import { AppStack } from './app-stack.js';
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';

type GlobalOptions = Parameters<SSTConfig['config']>[0];
type Config = ReturnType<SSTConfig['config']>;

export const ConfigManager = (input: GlobalOptions): Config => {
  return {
    name: 'rapid-examples',
    region: 'us-east-1',
  };
};

export const StackManager = (app: App): void => {
  // Set default function props
  app.setDefaultFunctionProps(() => ({
    runtime: 'nodejs20.x',
    architecture: 'arm_64',
    environment: {
      LOG_LEVEL: 'summary',
      APP_NAME: app.name,
    },
    nodejs: {
      esbuild: {
        external: ['@aws-sdk'],
        format: 'esm',
        minify: true,
        sourcemap: true,
        treeShaking: true,
      },
    },
  }));

  // Add your stacks here
  new AppStack(app, 'app-stack');

  // Set the retention policy for all Log Groups
  cdk.Aspects.of(app).add(new LogGroupRetentionPolicyAspect());
};


class LogGroupRetentionPolicyAspect implements cdk.IAspect {
  public visit(node: Construct): void {
    if (node instanceof logs.CfnLogGroup) {
      node.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    }
  }
}