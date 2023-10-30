import { SecretValue, Stack, StackProps, aws_codebuild } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as Amplify from "@aws-cdk/aws-amplify-alpha";

interface AmplifyHostingProps extends StackProps {
  owner: string;
  repository: string;
  token: string;
  envVariables: any;
  commands: any;
}

export class AmplifyHosting extends Stack {
  constructor(scope: Construct, id: string, props: AmplifyHostingProps) {
    super(scope, id, props);

    const amplify = new Amplify.App(this, "NextStableDiffusionDemo", {
      sourceCodeProvider: new Amplify.GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: SecretValue.secretsManager(props.token),
        // oauthToken: SecretValue.unsafePlainText(props.token),
      }),
      buildSpec: aws_codebuild.BuildSpec.fromObjectToYaml({
        version: "1.0",
        frontend: {
          phases: {
            preBuild: {
              commands: ["npm ci"],
            },
            build: {
              commands: props.commands,
            },
          },
          artifacts: {
            baseDirectory: ".next",
            files: ["**/*"],
          },
          cache: {
            path: ["node_modules/**/*"],
          },
        },
      }),
      platform: Amplify.Platform.WEB_COMPUTE,
      environmentVariables: props.envVariables,
    });

    amplify.addBranch("main", { stage: "PRODUCTION" });
  }
}
