import {
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_apigateway,
  aws_iam,
  aws_lambda,
  aws_logs,
} from "aws-cdk-lib";
import { Effect } from "aws-cdk-lib/aws-iam";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";

interface DiffusionProps extends StackProps {
  bucketName: string;
  endpointName: string;
}

export class DiffusionApi extends Stack {
  constructor(scope: Construct, id: string, props: DiffusionProps) {
    super(scope, id, props);

    // role for lambda
    const roleForLambda = new aws_iam.Role(
      this,
      "RoleForLambdaDiffusionPublic",
      {
        roleName: "RoleForLambdaDiffusionPublic",
        assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    roleForLambda.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
        ],
        resources: ["*"],
      })
    );

    roleForLambda.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sagemaker:*"],
        resources: ["*"],
      })
    );

    roleForLambda.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["s3:*"],
      })
    );

    const draw = new aws_lambda.Function(this, "DiffusionLambdaPublic", {
      functionName: "DiffusionLambdaPublic",
      code: aws_lambda.EcrImageCode.fromAssetImage(
        path.join(__dirname, "./../lambda-diffusion")
      ),
      handler: aws_lambda.Handler.FROM_IMAGE,
      runtime: aws_lambda.Runtime.FROM_IMAGE,
      memorySize: 1024,
      timeout: Duration.seconds(25),
      role: roleForLambda,
      environment: {
        BUCKET_NAME: props.bucketName,
        ENDPOINT_NAME: props.endpointName,
      },
    });

    const alias = new aws_lambda.Alias(
      this,
      "LiveAliasConcurrencyProvisioned",
      {
        aliasName: "live",
        version: draw.currentVersion,
        provisionedConcurrentExecutions: 10,
      }
    );

    // role for api gateway
    const roleForApiGw = new aws_iam.Role(
      this,
      "RoleForApiGwInvokeDrawPublic",
      {
        roleName: "RoleForApiGwInvokeDrawPublic",
        assumedBy: new aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
      }
    );

    roleForApiGw.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction"],
        resources: [draw.functionArn, `${draw.functionArn}:*`],
      })
    );

    roleForApiGw.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
        ],
        resources: ["*"],
      })
    );

    // api gateway
    const apigw = new aws_apigateway.RestApi(
      this,
      "ApiForDiffusionModelPublic",
      {
        restApiName: "ApiForDiffusionModelPublic",
        deploy: false,
        cloudWatchRole: true,
      }
    );

    const image = apigw.root.addResource("image");

    const getImageMethod = image.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(alias, {
        credentialsRole: roleForApiGw,
      })
    );

    image.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["*"],
    });

    // loggroup for api access
    const logGroup = new aws_logs.LogGroup(
      this,
      "AccessLogForDiffusionPublic",
      {
        logGroupName: "AccessLogForDiffusionPublic",
        removalPolicy: RemovalPolicy.DESTROY,
        retention: RetentionDays.ONE_WEEK,
      }
    );

    const deployment = new aws_apigateway.Deployment(
      this,
      "DeployDiffusionApiPublic",
      {
        api: apigw,
      }
    );

    const prodStage = new aws_apigateway.Stage(
      this,
      "DiffusionProdStagePublic",
      {
        stageName: "prod",
        deployment,
        dataTraceEnabled: true,
        accessLogDestination: new aws_apigateway.LogGroupLogDestination(
          logGroup
        ),
        accessLogFormat:
          aws_apigateway.AccessLogFormat.jsonWithStandardFields(),
      }
    );

    // usage plan and api key
    new aws_apigateway.RateLimitedApiKey(this, "RateLimitForDiffusionPublic", {
      apiKeyName: "RateLimitForDiffusionPublic",
      customerId: "DiffusionPublic",
      apiStages: [
        {
          api: apigw,
          stage: prodStage,
          throttle: [
            {
              method: getImageMethod,
              throttle: {
                burstLimit: 20,
                rateLimit: 10,
              },
            },
          ],
        },
      ],
      quota: {
        limit: 300,
        period: aws_apigateway.Period.DAY,
      },
      throttle: {
        burstLimit: 20,
        rateLimit: 10,
      },
      enabled: true,
      generateDistinctId: true,
      description: "rate limit for customer a by api key",
    });
  }
}
