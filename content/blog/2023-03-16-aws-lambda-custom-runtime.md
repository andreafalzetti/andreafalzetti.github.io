---
categories:
  - blog
date: 2023-03-16T22:53:00Z
tags:
  - aws
  - lambda
  - nodejs
title: "Combining Node.js and Python in a Single AWS Lambda Function"
description: Leverage Docker and Serverless Framework
---

Recently, I encountered a situation where I needed to run a Python script from a Node.js runtime using AWS Lambda. 

AWS supports several [runtimes for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) including Node.js, Python, Java, .Net, Go, Ruby and also Custom Runtime.

In my case I was already using `nodejs16.x` which of course, does not come with Python installed. After cosindering using Lambda layers or trying to compile the `.py` script into some stand-alone binary (which failed due to missing Python dependencies on the Lambda anyway), I've decided to give a try to the [Custom Runtime](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html).

Initially, I was put off by the possible amout of work involved into configuring a custom image, I guessed it would require at least a Dockerfile, publish the image to a registry and then instruct my Lambda to use that image, configure IAM permissions, etc.. Luckily, with [Serverless.com](https://www.serverless.com/) I figured the framework itself would do most of the heavy lifting so it turned out to be easier than expected. I presume doing the same with Terraform would require a little bit more of code.

I've decided to put together this blog post to help out folks doing something similar given that it wasn't so easy to find docs about this.

Let's go through the steps required:

1. Create a `Dockerfile`
1. Publish the image to ECR
1. Instrument your Lambda to use the new custom runtime

## Create a Dockerfile for a custom AWS Lambda runtime

This is simple as writing any Dockerfile, it's helpful to know that you can use AWS built images as starting point for your image. This is my example:


```dockerfile
FROM public.ecr.aws/lambda/nodejs:16

RUN yum install -y python3 && \
    pip3 install --upgrade pip requests

COPY . .

CMD ["lib/functions/index.handler"]
```

To find other AWS Lambda base images, check out: [Amazon ECR Public Gallery > Lambda](https://gallery.ecr.aws/lambda).

You could give it a go and build the image manually, but it's not required as the Serverless Framework will be doing that for us.

## Publish the image to ECR

If you haven't used ECR before, don't worry. It's a docker-compatible image registry which is available in your AWS account which can host public and private images. 

All you have to do is add this snippet to your `serverless.yml`:

```yaml
provider:
  ecr:
    images:
      node16-python3-runtime:
        path: ./
```

Please note:

1. `node16-python3-runtime` is an arbitrary name I gave to my image, feel free to rename it to whatever is best in your use-case.
1. `path` is the path to the directory containing the `Dockerfile`

Once you run `serverless deploy`, the tool will build the image for you, and publish the image to AWS ECR. If successful, once you open ECR in your AWS console, it should look something like the following:

![ecr-custom-lambda-runtime.png](/img/ecr-custom-lambda-runtime.png)

## Instrument your Lambda to use the new custom runtime

This is the final part, but it requires attention because it's very different from how you would usually define your Lambda and its handler in `serverless.yml`.

First of all: make sure to remove the `handler:` property that you usually have.

Second, add the property `image` as follows:

```yaml
functions:
  yourLambdaName:
    image:
      name: node16-python3-runtime
      command:
        - lib/functions/index.handler
      entryPoint:
        - '/lambda-entrypoint.sh'      
```

Let me explain:

1. `yourLambdaName` should be renamed of course with the name of your own lambda
1. `name: node16-python3-runtime` this should match the name of the image you created before, in `provider.ecr.image`
1. `command` is the command executed when the docker container starts, it should point to the handler function
1. `entryPoint` keep is as it is, to allow the Lambda service to know what to do

--- 

That should be it, I hope this guide is helpful to someone!
