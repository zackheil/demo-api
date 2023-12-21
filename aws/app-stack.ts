import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Api, App, Function, Stack } from 'sst/constructs';

const domainName = process.env._SST_DOMAIN_NAME as string;

if (!domainName) throw new Error('Missing _SST_DOMAIN_NAME environment variable');

export class AppStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    const apiFn = new Function(this, 'fn', {
      handler: 'backend/src/entry-points/api.handler',
      functionName: (props) => `${props.stack}-api-fn`,
    });

    const api = new Api(this, 'api', { 
      routes: { $default: apiFn },
      customDomain: {
        domainName,
        isExternalDomain: true,
        cdk: {
          certificate: new Certificate(this, 'cert', {
            domainName,
            validation: CertificateValidation.fromDns(),
          }),
        }
      }
    });

    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
