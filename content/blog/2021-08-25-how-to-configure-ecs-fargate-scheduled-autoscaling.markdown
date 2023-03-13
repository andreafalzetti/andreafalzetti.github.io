---
author: Andrea Falzetti
categories: blog
comments: true
date: "2021-08-25T07:35:00Z"
header-img: img/2021/docker-amazon-ecs.jpg
subtitle: Optimise your AWS bill leveraging Scheduled Autoscaling
tags: aws ecs autoscaling fargate
title: How to configure ECS Fargate Scheduled Autoscaling
---

You are looking at configuring **ECS Fargate scheduled autoscaling**, and you're feeling a bit lost?

That's how I felt a few days ago. To set this up, I struggled for a couple of days. Unfortunately, the documentation and examples I found online didn't help me much, so once I figured it out, I decided to share a working code example using Terraform.

To be on the same page, in this post, I am assuming that you know what you are doing, and you are aware that there are [different methods of autoscaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html). We will look at configuring scheduled autoscaling which may not be the best choice for your project.

Let's start by defining scheduled autoscaling, what it means and my use case for it. I am also very curious to know your story and how you'll leverage this feature. If you found this helpful, let me know in the comments.

## What is Scheduled Autoscaling?

Scheduled autoscaling means automatically increasing or decreasing the number of computing resources at a specific time of the day. 

## My use case for Scheduled Autoscaling

My main goal is **cost optimisation**. I recently ran out of the $10,000 credits provided by AWS Activate for Startups, and the highest cost on the bill was the ECS cluster. If you're interested in that, I am currently writing another blog post describing more in detail that story.

## Code Example (using Terraform)

Finished talking, let's look at some Terraform code examples.

I'll introduce the resources that you need one by one.

### 01. Create an Autoscaling Target

If you want to configure autoscaling for ECS, the Autoscaling Target is your ECS Service, example:

```terraform
# autoscaling.tf

resource "aws_appautoscaling_target" "service" {
  service_namespace  = "ecs"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.scheduled_min_capacity # 0
  max_capacity       = var.scheduled_max_capacity # 1
  resource_id        = "service/${local.cluster_name}/${local.service_name}"
}
```

The code above assumes you already have your ECS service provisioned, like:

```hcl
# ecs-service.tf

resource "aws_ecs_service" "service" {
  name    = local.service_name
  cluster = local.cluster_name
  [...omitted as not relevant...]
}
```

### 02. Define your Scheduled Actions

To scale in and out the service, you will need at least two scheduled actions, one to increase the number of desired tasks, the second one to decrease it.

```hcl
# autoscaling.tf

...[aws_appautoscaling_target code above omitted]

resource "aws_appautoscaling_scheduled_action" "scale_service_out" {
  name               = "${local.service_name}-scale-out"
  service_namespace  = aws_appautoscaling_target.service.service_namespace
  resource_id        = aws_appautoscaling_target.service.resource_id
  scalable_dimension = aws_appautoscaling_target.service.scalable_dimension
  schedule           = "cron(0 6 * * ? *)"
  timezone           = "Europe/London"

  scalable_target_action {
    min_capacity = var.scheduled_max_capacity # 1
    max_capacity = var.scheduled_max_capacity # 1
  }
}

resource "aws_appautoscaling_scheduled_action" "scale_service_in" {
  name               = "${local.service_name}-scale-in"
  service_namespace  = aws_appautoscaling_target.service.service_namespace
  resource_id        = aws_appautoscaling_target.service.resource_id
  scalable_dimension = aws_appautoscaling_target.service.scalable_dimension
  schedule           = "cron(0 21 * * ? *)"
  timezone           = "Europe/London"

  scalable_target_action {
    min_capacity = var.scheduled_min_capacity # 0
    max_capacity = var.scheduled_min_capacity # 0
  }

  depends_on = [aws_appautoscaling_scheduled_action.scale_service_out]
}
```

In my case, for the dev cluster, I shut down all tasks for most of the day, while in prod I leave at least 1 and during office hours I have up to 3.

To do that, you will also need the following variables:

```hcl
# vars.tf
variable "scheduled_min_capacity" {}
variable "scheduled_max_capacity" {}
```

For development:

```hcl
# config/dev/terraform.tfvars
scheduled_min_capacity = 0
scheduled_max_capacity = 1
```

And prodution:

```hcl
# config/prod/terraform.tfvars
scheduled_min_capacity = 1
scheduled_max_capacity = 3
```

That's it. Next, let's understand how to validate and test these changes.

### Let's test it

Once you deploy those resources to verify that everything works, you can, of course, stare and refresh the ECS dashboard and see the number of ECS tasks increasing and decreasing. However, if you want a more efficient way, I'd recommend using the aws-cli, because apparently, this information is not available on AWS Console.

Run this command to list the existing scheduled actions:

```bash
aws application-autoscaling describe-scheduled-actions --service-namespace ecs
```

The result, should look like this:

```json
{
    "ScheduledActions": [        
        {
            "ScheduledActionName": "<SERVICE-NAME>-scale-up",
            "ScheduledActionARN": "arn:aws:autoscaling:<AWS-REGION>:<AWS-ACCOUNT-ID>:scheduledAction:<ID>:resource/ecs/service/<CLUSTER-NAME>/<SERVICE-NAME>:scheduledActionName/<SERVICE-NAME>-scale-up",
            "ServiceNamespace": "ecs",
            "Schedule": "cron(0 6 * * ? *)",
            "ResourceId": "service/<CLUSTER-NAME>/<SERVICE-NAME>",
            "ScalableDimension": "ecs:service:DesiredCount",
            "ScalableTargetAction": {
                "MinCapacity": 1,
                "MaxCapacity": 1
            }
        },
        {
            "ScheduledActionName": "<SERVICE-NAME>-scale-down",
            "ScheduledActionARN": "arn:aws:autoscaling:<AWS-REGION>:<AWS-ACCOUNT-ID>:scheduledAction:<ID>:resource/ecs/service/<CLUSTER-NAME>/<SERVICE-NAME>:scheduledActionName/<SERVICE-NAME>-scale-down",
            "ServiceNamespace": "ecs",
            "Schedule": "cron(0 23 * * ? *)",
            "ResourceId": "service/<CLUSTER-NAME>/<SERVICE-NAME>",
            "ScalableDimension": "ecs:service:DesiredCount",
            "ScalableTargetAction": {
                "MinCapacity": 0,
                "MaxCapacity": 0
            }
        } 
    ]
}
```

You can also check recent autoscaling activities (although this is also available on the ECS service Events page);

```bash
aws application-autoscaling describe-scaling-activities --service-namespace ecs
```

output:

```json
{
    "ScalingActivities": [
        {
            "ActivityId": "a7edfe9b-b924-4468-a129-736ce0a06078",
            "ServiceNamespace": "ecs",
            "ResourceId": "service/<CLUSTER-NAME>/<SERVICE-NAME>",
            "ScalableDimension": "ecs:service:DesiredCount",
            "Description": "Setting desired count to 1.",
            "Cause": "minimum capacity was set to 1",
            "StartTime": "2021-08-24T06:00:16.520000+01:00",
            "EndTime": "2021-08-24T06:00:47.551000+01:00",
            "StatusCode": "Successful",
            "StatusMessage": "Successfully set desired count to 1. Change successfully fulfilled by ecs."
        }
]
```

### Conclusion

Scheduled autoscaling is a simple way to introduce autoscaling in your ECS cluster.

I find the concept of saving and optimising resources exciting. The idea of turning off the machine when we don't need it sounds the right thing to do.

I wouldn't necessarily recommend using scheduled autoscaling to solve scalability challenges. For example, if you have unpredictable workloads, you might find [Tracking Autoscaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html) more suited.

I hope you found this helpful. 🙏

### Sources

I used the following docs/blogs to learn how to configure scheduled autoscaling, and you might find them helpful too:

- https://keita.blog/2018/01/29/aws-application-auto-scaling-for-ecs-with-terraform/
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_scheduled_action
- https://gist.github.com/toricls/fea9d8a4eb606a27f6666a1abc6a6fd8

Also available on https://dev.to/andreafalzetti/how-to-configure-ecs-fargate-scheduled-autoscaling-556c
