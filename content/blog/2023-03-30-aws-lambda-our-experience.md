---
categories:
  - blog
date: 2023-03-30T23:00:00Z
tags:
  - aws
  - lambda
  - serverless
title: "AWS Lambda: Lessons learned over 5 years and 100 functions in production"
description: "Our hands-on experience: the good & the bad"
---

At [onoranzefunebricloud.com](https://onoranzefunebricloud.com) we provide funeral agencies with digital solutions to do their best work, and to build such complex tools we use a combination of AWS services including dockerized applications in Fargate and lot of Serverless tools such as Lambda.

Over the years, as we introduced more functionalities we've also grown our usage of Lambda, and as of today we count over 100 Lambda functions in production.

In this post I want to share the lessons learned, the good and the bad.

I've organized the content in 4 sections:

1. The good
2. The bad
3. Recommendations
4. Conclusions

![130 aws lambdas](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a8m6rnlfptfughh5b8hy.png)

---

## The good

1. **Zero daily operations & no downtime**: Over 5 years we never had a downtime on the services built on Lambda. The product has been very reliable for us and we are always confident it will scale for us, when needed, without any manual operation on our side. Wait! Lambda doesn't scale indefinitely! There are soft and hard limits to keep in mind, for example, by default you can have up to 1000 concurrent Lambdas running in a given AWS region at any given time. We have a predictable work load, that's why I have this confidence. Check out [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) to know more.

2. 💰 **Affordable**: For a long time we were paying $0! Until our startup got traction, our AWS bills have been very low thanks to using Lambda and the generous [AWS free tier](https://aws.amazon.com/lambda/pricing/).

3. **Tiny codebase ➡️ Easy to contribute to**: Having services separated into each own repository and its own set of Lambdas in our experience has simplified and made easier to contribute to a project. The learning curve of the codebase is very small because the codebase is tiny!

4. **Separation of concerns**: Having services deployed as an independent Lambda means for us having decoupled components which meant individual contributors felt safe in modifying, deploying a service without the worry of breaking another one. If something went wrong, only an isolated service would be affected and it would be easier to debug.

5. **Versatile**: Lambda is very flexible in terms of what you can do with it. In a [recent blog post](https://dev.to/andreafalzetti/combining-nodejs-and-python-in-a-single-aws-lambda-function-53bl) I've even shared how I am using a runtime with multiple programming languages.

## The bad

1. **Too many Lambdas**: Having too many Lambdas to update could result in a maintenance burden. For example, some of the first Lambdas we built back in 2017 were running in Node.js 14 which AWS has deprecated. We were not planning to work on those, so for us that was unplanned work that we had to undertake to avoid being stuck and blocked in making new changes to those Lambdas.

2. **Expensive if misused**: Lambda is not a silver bullet, in fact, if misused it can lead to very expensive bills. Using it for high-load or long-running tasks, it will definitely make you incur in pricy bills. Choose carefully how to use it.

3. **Configuration Expert**: Lambda has evolved a lot in the past 5 years. The initial concept: "take this code and run it" is slowly fading away over time, due to the addition of tons of configuration. You can still get started pretty quickly, but you can also get lost in fine tuning or configuring your function.

## Recommendations

### 🎯 Choose, with care

Do not default to Lambda for everything. This is a mistake I did at the beginning, building REST APIs on Lambda might not be the best decision, especially when you grow and scale, you might regret it.

Lambda is great for gluing together components, building event-driven systems and much more, but for long-running and intense compute processes, it might make sense only in certain scenarios.

### 📟 Get paged when it fails

Your code will fail and you want know when that happens. We use `serverless-plugin-aws-alerts` to instrument CloudWatch alarms and dashboards for our Lambdas and [OpsGenie](https://www.atlassian.com/software/opsgenie) to page us on Slack or on our phones. 

You need to configure OpsGenie to use SNS and then the simplest approach is alert on failures, for example `serverless.yml`:

```yaml
custom:
  # Lambda Alarms
  alerts:
    stages:
      - prod
    dashboards: false
    topics:
      alarm:
        topic: arn:aws:sns:${self:provider.region}:${aws:accountId}:opsgenie
    definitions:
      functionErrors:
        namespace: 'AWS/Lambda'
        metric: Errors
        threshold: 1
        statistic: Sum
        period: 60
        evaluationPeriods: 1
        datapointsToAlarm: 1
        comparisonOperator: GreaterThanOrEqualToThreshold
        treatMissingData: missing
    alarms:
      - functionErrors
```

This alert is quite aggressive, it will page you as soon as there's an error, you can tune that to your preference.

### 🛠️ Debug locally

We use VSCode and Serverless to run and debug our code as if it was running in Lambda. Example `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "console": "integratedTerminal",            
            "name": "hello",
            "env": {
                "AWS_PROFILE": "<YOUR_PROFILE>",
                "SLS_DEBUG": "*",
            },
            "program": "${workspaceFolder}/node_modules/.bin/sls",
            "args": [
                "invoke",
                "local",
                "-s",
                "dev",
                "-f",
                "hello",
                "-p",
                "./examples/event.json"
            ]
        }       
    ]
}
```

In `./examples/event.json` you can store your test event, such as API Gateway or CloudWatch payloads.

Another approach, can be using [OpenFaaS](https://www.openfaas.com/) but this is a tool that I didn't have the opportunity to try yet.

### 📦 Keep it small! 

We use `serverless-esbuild` to reduce the bundle size, it makes deployments and cold time faster.

### 📚 Stay up to date

You will find having up to date knowledge very handy the next time you're taking an important decision for example using or not Lambda or any other AWS service. I recommend following Yan's work on [Twitter](https://twitter.com/theburningmonk) and his website [theburningmonk.com](https://theburningmonk.com/). 

Another valuable asset is [AWS This Week](https://acloudguru.com/videos/aws-this-week) by the folks of ACloudGuru.

---

## Conclusions

Lambda is a great tool if leveraged correctly, at the same time it's not a silver bullet.

I suggest you to listen in to some podcasts and read few more blog posts if the concept is still blurred.

[Getting started](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html) if fairly simple, especially with the [Serverless Framework](https://www.serverless.com/)

What are you waiting for? Give it a try.
