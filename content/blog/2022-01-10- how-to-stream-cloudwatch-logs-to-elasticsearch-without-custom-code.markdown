---
author: Andrea Falzetti
categories: blog
comments: true
date: "2022-01-10T20:00:00Z"
header-img: img/2021/docker-amazon-ecs.jpg
subtitle: ""
tags: functionbeat, cloudwatch, elasticsearch, aws
title: How to stream CloudWatch logs to Elasticsearch without custom code
---

## Intro
In this post, I want to share the approach I have been using to ship logs from AWS CloudWatch to Elasticsearch without writing a single line of code.

## My use case
In my side-project, I use a combination of Lambdas and Fargate tasks which both write JSON-formatted logs to CloudWatch.

I use CloudWatch to debug application errors while I use Elasticsearch for storing custom events such as User Actions (e.g. User X created resource Y).

By querying Elasticsearch, I can build up a view of all actions performed by a user within the platform.
![timeline](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/65l6ms2r7726c9bfb1yb.png)

I use the User Actions timeline view to monitor the platform's usage. I also expose this information to the user, so they have historical transactions of what and when they did something within the product.

I came up with a simple JSON schema that represents actions, and I instrumented my applications to spit out those events to CloudWatch when those occur.

I mentioned above my reason for requiring CloudWatch logs to be streamed to Elasticsearch. You might have a different one, such as backing up all logs to another system or post-process logs for security or any other possible reason.

## My solution: Using Functionbeat

![functionbeat](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r316mgtuuzkxan9uzrnu.png)

I wanted to achieve this objective ideally without writing custom code that later I had to maintain.

Assuming I wasn't the first one with this requirement, I looked around to see how people replicated logs over Elasticsearch. The most common pattern I've seen is having a Lambda function subscribed to the CloudWatch log group you are interested in.

The complexities of building your own Lambda would be writing the code that ingests, processes, and publishes and creating a flexible and automated mechanism to subscribe this Lambda to dozens or hundreds of log groups.

After some research, I stumbled upon Functionbeat, an open-source tool from Elastic.

"Function-beat", as the name suggests, is a pre-made Lambda function, written in Go, provided by Elastic, which you can deploy to your AWS account. Using its configuration file, you can define which CloudWatch Log Groups Functionbeat should subscribe to.

You can also define processing rules for excluding a record, dropping specific fields, or applying transformations to the records.

Essentially, an off-the-shelf solution that follows a community sanctioned approach without having to worry about writing it from scratch.

Let's now see some code and example configurations!

### How to use Functionbeat

Follow [this link](https://www.elastic.co/guide/en/beats/functionbeat/current/functionbeat-installation-configuration.html) for official installation instructions. In short, all I did was:

#### 1 - Create a private repository
You will need to host the binary and configuration of Functionbeat. Also, you might want to set up a CI/CD pipeline to deploy updates on push quickly.

#### 2 - Download Functionbeat
Download Functionbeat from the official Elastic website. Drop the binary in your brand new repository a

#### 3 - Configure it
Create a `functionbeat.yml` by looking at the provided config example in `functionbeat.reference.yml` start populating your Elasticsearch endpoint and credentials. 

I use Elastic cloud, but you can also stream to a self-hosted instance of Elasticsearch. Check [this step](https://www.elastic.co/guide/en/beats/functionbeat/current/functionbeat-installation-configuration.html#set-connection) for more details.

In this phase, you will also define to which CloudWatch Log Groups you want to subscribe your Functionbeat

This is an example config file:

```yaml
# functionbeat.yml
functionbeat.provider.aws.endpoint: "s3.amazonaws.com"
functionbeat.provider.aws.deploy_bucket: "${YOUR_AWS_ACCOUNT_ID}-functionbeat-deploy"
functionbeat.provider.aws.access_key_id: '${AWS_ACCESS_KEY_ID}'
functionbeat.provider.aws.secret_access_key: '${AWS_SECRET_ACCESS_KEY}'
functionbeat.provider.aws.functions:
  - name: functionbeat
    enabled: true
    type: cloudwatch_logs
    description: "Ships CloudWatch logs to Elasticsearch"
    triggers:
      - log_group_name: /aws/lambda/lambda-A
      - log_group_name: /aws/lambda/lambda-B
      - log_group_name: /aws/lambda/lambda-C

    processors:
      - drop_event:
          when:
            contains:
              message: "START RequestId:"
      - drop_event:
          when:
            contains:
              message: "REPORT RequestId:"
      - drop_event:
          when:
            contains:
              message: "END RequestId:"
      - drop_event:
          when:
            contains:
              message: "ELB-HealthChecker/2.0"

      - decode_json_fields:
          fields: ["message"]
          process_array: false
          max_depth: 1
          target: ""
          overwrite_keys: false

      - drop_fields:
          fields:
            - private
            - host.name
            - hostname
            - v
            - time
            - pid
            - id
            - message

cloud.id: "${ES_ID}"
cloud.auth: "elastic:${ES_PWD}"

#============================== Setup ILM =====================================

# Configure Index Lifecycle Management Index Lifecycle Management creates a
# write alias and adds additional settings to the template.
# The elasticsearch.output.index setting will be replaced with the write alias
# if ILM is enabled.

# Enabled ILM support. Valid values are true, false, and auto. The beat will
# detect availabilty of Index Lifecycle Management in Elasticsearch and enable
# or disable ILM support.
setup.ilm.enabled: auto

# Configure the ILM write alias name.
setup.ilm.rollover_alias: "functionbeat"

# Configure rollover index pattern.
setup.ilm.pattern: "{now/d}-000001"
```

#### 4 - Deploy it
Functionbeat comes with a CloudFormation config which you can simply deploy to your AWS account.

```shell
./functionbeat setup -e
./functionbeat -v -e -d "*" deploy functionbeat
```

If the config doesn't contain any error, Functionbeat will subscribe to the specified CloudWatch Log Groups once deployed.

Now, it's time to generate some logs and see them replicated in Elasticsearch!

### Troubleshooting

If you don't see the logs in Elasticsearch, you can debug the Functionbeat execution by looking at Lambda's logs. Most likely, you're facing a configuration issue, but Functionbeat generally will tell you what's wrong.


### Considerations

✅ I've been successfully using this approach for over 12 months, and I am pretty satisfied.

✨ Since it was created, additional features were added, such as support for SQS and Kinesis.

🚩 Since I've started using it, Elastic has released a few newer releases, and the upgrade wasn't always a smooth experience. 

Finally, if you decide to use Functionbeat, I would recommend writing a CloudWatch alarm to monitor its health.

If you end up using Functionbeat, drop me a message and let me know :)
