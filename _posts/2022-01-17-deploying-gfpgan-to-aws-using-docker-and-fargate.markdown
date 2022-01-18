---
layout: post
comments: true
title: 'Deploying GFPGAN to AWS using Docker and Fargate'
subtitle: 'Deploying a Machine Learning container to AWS ECS Fargate'
date: 2022-01-17 20:00:00
categories: blog
tags: gfpgan, machinelearning, fargate, docker
author: 'Andrea Falzetti'
header-img: 'img/2021/docker-amazon-ecs.jpg'
---

> This post aims to help you deploy [GFPGAN](https://github.com/TencentARC/GFPGAN) on AWS using ECS Fargate.

----

## What is GFPGAN?!

I've recently discovered this fantastic Machine Learning project trained and designed to restore faces.

The project's headline is: 
> GFPGAN aims at developing Practical Algorithms for Real-world Face Restoration.

In short, given a blurred, damaged, or low-quality photo of a person's face, the algorithm it's able to restore the face and improve its quality.

Example

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">GFPGAN is a new AI model for photo restoration. Nothing was manually adjusted in this example. 😮👍 <a href="https://t.co/AwNRxw6bZ3">https://t.co/AwNRxw6bZ3</a> <a href="https://twitter.com/hashtag/ai?src=hash&amp;ref_src=twsrc%5Etfw">#ai</a> <a href="https://twitter.com/hashtag/ml?src=hash&amp;ref_src=twsrc%5Etfw">#ml</a> <a href="https://twitter.com/hashtag/ArtificialIntelligence?src=hash&amp;ref_src=twsrc%5Etfw">#ArtificialIntelligence</a> <a href="https://twitter.com/hashtag/MachineLearning?src=hash&amp;ref_src=twsrc%5Etfw">#MachineLearning</a> <a href="https://twitter.com/hashtag/photography?src=hash&amp;ref_src=twsrc%5Etfw">#photography</a> <a href="https://t.co/EYS5c4FiWd">pic.twitter.com/EYS5c4FiWd</a></p>&mdash; Metin Seven (@metinse7en) <a href="https://twitter.com/metinse7en/status/1405465023015755776?ref_src=twsrc%5Etfw">June 17, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0lfcako8ijxfisys3a31.jpg)

## The challenge

So, I decided to write this blog post because I recently deployed this tool on AWS, and there were a few things that I wish I had known before starting.

GFPGAN is written in Python, and its entry point assumes you're going to convert a batch of images, reading and writing those from disk.

Now, I am not sure about your use case, but this was a significant limitation for me.

If you're intimidated by Python, don't worry. The entry point is relatively simple to modify. I didn't have any Python experience before this.

My use case is to provide an HTTP API to a front-end application to call and retrieve the enhanced image.

## Architecture

To provide such API, I came up with this architecture that is currently working fine in my side-project.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r73gf3t1yjhf1dme73f4.png)

To better understand the flow, this is a sequence diagram:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g4zuukm891vul854unze.png)

## How to Use it

Before you start getting your hands dirty with Terraform or CloudFormation code, I recommend trying out the Docker image locally.

### Step 1 - Fork the repo

At the moment of writing this, the official repository has an [open PR for adding the Dockerfile](https://github.com/TencentARC/GFPGAN/pull/103), shout out to [Mostafa Elmenbawy](https://github.com/mmenbawy) for his valuable contribution!

I also want to personally thank Mostafa for helping me understand how GFPGAN Python entry point works!

I recommend forking his repo until the PR has been merged.

### Step 2 - Build the image

```shell
docker build -t gfpgan .
```

### Step 3 - Run the container

```shell
docker run \
    --name gfpgan \
    --rm \
    --volume <PROJECT_ABSOLUTE_PATH>/inputs:/app/inputs \
    --volume <PROJECT_ABSOLUTE_PATH>/results:/app/results \
    gfpgan \
    python3 inference_gfpgan.py --upscale 2 --test_path inputs --save_root results
```

The command above will start the container that, by running GFPGAN, will transform the default inputs photos and produce outputs in the results folder.

## How to Deploy It

Before proceeding, please note that I've adapted the Python entry point to integrate with SQS to receive jobs, S3 to persist the enhanced image files, and DynamoDB as a temporary state to inform the web-app about the status of the job.

### Step 1 - Customize the entry point

I have changed [inference_gfpgan.py](https://github.com/TencentARC/GFPGAN/blob/master/inference_gfpgan.py) as follows:

```python
import boto3
import cv2
import glob
import numpy as np
import os
import json
import requests
import logging
import time
import uuid

from pythonjsonlogger import jsonlogger
from basicsr.utils import imwrite
from pathlib import Path
from gfpgan import GFPGANer

sqs = boto3.resource("sqs")
queue = sqs.get_queue_by_name(QueueName=os.environ["SQS_QUEUE_NAME"])
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])
s3 = boto3.client("s3")

for name in ["boto", "urllib3", "s3transfer", "boto3", "botocore", "nose"]:
    logging.getLogger(name).setLevel(logging.CRITICAL)

def setup_logging(log_level):
    logger = logging.getLogger()

    logger.setLevel(log_level)
    json_handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
    )
    json_handler.setFormatter(formatter)
    logger.addHandler(json_handler)

def main(logger, message):
    [f.unlink() for f in Path("./inputs").glob("*") if f.is_file()]
    [f.unlink() for f in Path("./results").glob("*") if f.is_file()]

    model_path = "experiments/pretrained_models/GFPGANCleanv1-NoCE-C2.pth"
    upscale = 2
    arch = "clean"
    channel = 2
    ext = "auto"
    suffix = None
    save_root = "results"
    os.makedirs(save_root, exist_ok=True)

    inputs_path = os.path.join("inputs", "input.jpg")

    img_data = requests.get(url=message["imageUrl"]).content

    logger.info(f"Downloading image {message['imageUrl']} to {inputs_path}")

    try:
        with open(inputs_path, "wb") as handler:
            handler.write(img_data)
    except:
        logger.error('Cannot download file')
        return

    restorer = GFPGANer(
        model_path=model_path,
        upscale=upscale,
        arch=arch,
        channel_multiplier=channel,
        bg_upsampler=None,
    )

    img_list = sorted(glob.glob(os.path.join("inputs", "*")))
    for img_path in img_list:
        # read image
        img_name = os.path.basename(img_path)
        logger.info(f"Processing {img_name} ...")
        basename, ext = os.path.splitext(img_name)
        input_img = cv2.imread(img_path, cv2.IMREAD_COLOR)

        # restore faces and background if necessary
        cropped_faces, restored_faces, restored_img = restorer.enhance(
            input_img, has_aligned=False, only_center_face=True, paste_back=True
        )

        # save faces
        for idx, (cropped_face, restored_face) in enumerate(
            zip(cropped_faces, restored_faces)
        ):
            # save cropped face
            save_crop_path = os.path.join(
                save_root, "cropped_faces", f"{basename}_{idx:02d}.png"
            )
            imwrite(cropped_face, save_crop_path)
            # save restored face
            if suffix is not None:
                save_face_name = f"{basename}_{idx:02d}_{suffix}.png"
            else:
                save_face_name = f"{basename}_{idx:02d}.png"
            save_restore_path = os.path.join(
                save_root, "restored_faces", save_face_name
            )
            imwrite(restored_face, save_restore_path)
            # save comparison image
            cmp_img = np.concatenate((cropped_face, restored_face), axis=1)
            imwrite(
                cmp_img, os.path.join(save_root, "cmp", f"{basename}_{idx:02d}.png")
            )

        if restored_img is not None:
            if ext == "auto":
                extension = ext[1:]
            else:
                extension = ext

            if suffix is not None:
                save_restore_path = os.path.join(
                    save_root, "restored_imgs", f"{basename}_{suffix}.{extension}"
                )
            else:
                save_restore_path = os.path.join(
                    save_root, "restored_imgs", f"{basename}.{extension}"
                )

            logger.info(f"Saving restored image to {save_restore_path} ...")

            imwrite(restored_img, save_restore_path)

    s3key = f'gfpgan_{message["orgId"]}_{uuid.uuid4().hex}.jpg'
    s3.upload_file(
        "results/restored_imgs/input..jpg", os.environ["S3_BUCKET_NAME"], s3key
    )
    new_record = message.copy()
    new_record["enhancedImageS3Key"] = s3key
    new_record["updatedAt"] = round(time.time())
    new_record["timeTaken"] = new_record["updatedAt"] - new_record["createdAt"]
    update_record(new_record)
    logger.info(f"Result uploaded in S3: {s3key}")


def create_record(message):
    response = table.put_item(
        Item={
            "enhancementId": message["enhancementId"],
            "imageUrl": message["imageUrl"],
            "createdAt": message["createdAt"],
        }
    )
    return response


def update_record(message):
    response = table.put_item(
        Item={
            "enhancementId": message["enhancementId"],
            "imageUrl": message["imageUrl"],
            "createdAt": message["createdAt"],
            # Additional Props
            "enhancedImageS3Key": message["enhancedImageS3Key"],
            "updatedAt": message["updatedAt"],
            "timeTaken": message["timeTaken"],
        }
    )
    return response

def retrieve_messages():
    setup_logging(logging.INFO)
    logger = logging.getLogger()
    logger.info("Starting retrieve_messages")
    while True:
        logger.debug("Fetching SQS messages")
        messages = queue.receive_messages(MaxNumberOfMessages=1, WaitTimeSeconds=1)
        for message in messages:
            parsed_message = json.loads(message.body)
            parsed_message["createdAt"] = round(time.time())
            logger.info(parsed_message)
            create_record(parsed_message)
            main(logger, parsed_message)
            message.delete()
        time.sleep(5)


if __name__ == "__main__":
    retrieve_messages()
```

Note: the code above pulls new messages from SQS every 5 seconds. 

The SQS message should follow this schema:

```json
{"enhancementId": "12345", "imageUrl": "https://example.com/photo.jpg"}
```

### Step 2 - Update the Dockerfile

I've also updated the Dockerfile as follows. Again, shout out to [Mostafa Elmenbawy](https://github.com/mmenbawy) for creating the initial Dockerfile! 🙏

```Dockerfile
FROM nvidia/cuda:10.0-cudnn7-devel

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends --fix-missing \
    # python
    python3.8 python3-pip python3-setuptools python3-dev \
    # OpenCV deps
    libglib2.0-0 libsm6 libxext6 libxrender1 libgl1-mesa-glx \
    # c++
    g++ \
    # others
    wget unzip

# Ninja
RUN wget https://github.com/ninja-build/ninja/releases/download/v1.8.2/ninja-linux.zip && \
    unzip ninja-linux.zip -d /usr/local/bin/ && \
    update-alternatives --install /usr/bin/ninja ninja /usr/local/bin/ninja 1 --force

# basicsr facexlib
RUN python3 -m pip install --upgrade pip && \
    pip3 install --no-cache-dir torch>=1.7 opencv-python>=4.5 && \
    pip3 install --no-cache-dir basicsr facexlib realesrgan boto3 python-json-logger uuid

# weights
RUN wget https://github.com/TencentARC/GFPGAN/releases/download/v0.2.0/GFPGANCleanv1-NoCE-C2.pth \
        -P experiments/pretrained_models &&\
    wget https://github.com/TencentARC/GFPGAN/releases/download/v0.1.0/GFPGANv1.pth \
        -P experiments/pretrained_models && \
    wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth \
        -P /usr/local/lib/python3.6/dist-packages/realesrgan/weights/ && \
    wget https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth \
        -P /usr/local/lib/python3.6/dist-packages/facexlib/weights/

RUN rm -rf /var/cache/apt/* /var/lib/apt/lists/* && \
    apt-get autoremove -y && apt-get clean

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .
RUN pip3 install .

CMD ["python3", "inference_gfpgan.py"]
```

### Step 3 - Publish the image to ECR

In your CI/CD, build the Dockerfile and publish the image to ECR.

### Step 4 - Deploy the ECS task using Fargate

Using Terraform or CloudFormation, create and deploy the ECS task. Please note, this service doesn't need to be exposed to the internet via Route53 or an Application Load Balancer. 

If you have deployed APIs or public-facing services before to ECS, you might be familiar with configuring the Target Group's healthcheck. The healthcheck detects if the main process running in the container is still health or the container needs to be restarted.

In this case, the container doesn't expose an HTTP endpoint for the Target Group to call, so we have to use [container level healthchecks](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_HealthCheck.html).

Instead of configuring the healthcheck in the Target Group, container-level healthchecks are defined in the ECS task definition, as follows:

```json
...
    "healthCheck": {
      "command": [ "CMD-SHELL", "exit 0" ],
      "startPeriod": 20
    },
...
```

Please note, the `CMD-SHELL` can be any bash command. Ideally, the command would help you validate if the process is healthy. 

By using `exit 0`, you assume that the container is always healthy.

This is not ideal, but I haven't found an alternative approach yet.

### Takeaways

GFPGAN:
- is a ML project able to restore damaged or low-quality photos
- is written in Python but the interface is fairly easy to modify, even if you're not a Python Developer
- can be containerized in Docker 
- can be deployed to ECS Fargate, I am using 2 GB o RAM and 1 CPU
- you can easily integrate it with a queue system and integrate it with your app via an API

### Conclusions

Hopefully, I've provided you with a real-world scenario in which GFPGAN is used and deployed to AWS.

I didn't include the entire Terraform code to keep the blog post readable, but I am happy to share more.

Just reach out to me if you need any help with this; I am more than happy to give you a hand deploying GFPGAN to AWS.
