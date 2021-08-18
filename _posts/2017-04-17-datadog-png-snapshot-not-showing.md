---
layout: post
comments: true
title: 'Datadog PNG snapshot not showing'
subtitle: 'in Slack incoming webhook attachments'
date: 2017-04-17 19:00:00
categories: blog
tags: javascript nodejs datadog slack chatbots webhooks
author: "Andrea Falzetti"
header-img: "img/macbook-stickers.jpg"
---

## Issue <i class="em em-rage4"></i>
If you are here, you have probably experienced the same issue I did using the [Datadog programmatic API  v1](http://docs.datadoghq.com/api/#graph-snapshot) to generate PNG snapshot of your metrics.

I have integrated Datadog metrics in Slack using snapshots and incoming webhooks as shown below:

![Datadog Slack Example]({{site.url}}/img/attachment_example_datadog.png)

The problem I was facing was that the image was missing or simply not displaying! But, whenever I opened the URL of the snapshot in the browser or using the [Slack Message Builder](https://api.slack.com/docs/messages/builder) there!

I eventually found out that it was a problem of **time**.

### Solution: Delay <i class="em em-alarm_clock"></i>
Add a delay of _few seconds_ before displaying the image or before calling the Slack API to send the attachment will solve the issue. This time is needed for Datadog to generate the actual image file. I am currently using a 60 seconds delay, just to make sure it doesn't happen again.

A more elegant solution would be requesting the image, checking the size of the document or maybe the content-type and only then using the snapshot URL provided by Datadog. For the moment, the delay just works for me.

Sounds stupid, but I wasted at least half an hour on this. Hopefully, you will find this article before wasting any of your time!

Happy coding! <i class="em em-sunglasses"></i>
