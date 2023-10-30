import * as cdk from "aws-cdk-lib";
import { DiffusionApi } from "../lib/apigw-diffusion";
import { AmplifyHosting } from "../lib/amplify-hosting";
import { config } from "../config";

const app = new cdk.App();

new DiffusionApi(app, "DiffusionApiPublic", {
  bucketName: config.BUCKET_NAME,
  endpointName: config.ENDPOINT_NAME,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});

new AmplifyHosting(app, "NextStableDifussionPublic", {
  owner: "cdk-entest",
  repository: "next-stable-diffusion",
  token: "next-polly-image-app",
  commands: ["npm run build"],
  envVariables: {},
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
