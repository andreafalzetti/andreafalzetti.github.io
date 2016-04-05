---
layout: post
comments: true
title: 'How to create a smart Slack Bot in Node.js'
subtitle: 'that schedules events using text analysis API'
date: 2016-03-22 09:00:00
categories: blog
tags: nodejs caldav slack bot
author:     "Andrea Falzetti"
header-img: "img/post-bg-01.jpg"
---

The challenge here was creating a **bot able to schedule events**. Part of our internal tools at [Activate Media](http://activate.co.uk), **PlannerBot**, so it has been named, is now a member of our team. He currently lives in Slack, online 24/7 for 365 days of the year, programmed with the idea in mind that one day he could be moved to Facebook Messenger, Skype, or any other messaging platform.

## Demo

In this case I give a partial information, so the **bot will ask me** the missing details.

![smart-bot-example-1]({{site.urk}}/img/smart-bot-example-1.jpg)

----------

Now I will give him a full description of the event, he doesn't need any other information so it will just ask me to confirm.

![smart-bot-example-2]({{site.urk}}/img/smart-bot-example-2.jpg)

----------

And here I'm scheduling a multiple-days event, the bot understands that **time** is not required.

![smart-bot-example-3]({{site.urk}}/img/smart-bot-example-3.jpg)

----------

Typing `help` or `help me` the bot will return a preset message.

![smart-bot-example-4]({{site.urk}}/img/smart-bot-example-4.jpg)

----------

At any point, using the words `stop`, `don't worry` or `cancel` the bot will forget about your event.

![smart-bot-example-5]({{site.urk}}/img/smart-bot-example-5.jpg)

----------

After 5 minutes, if you don't answer its question, the bot will forget about your event.

![smart-bot-example-6]({{site.urk}}/img/smart-bot-example-6.jpg)


PlannerBot also reminds us the daily events every morning, as described in a [previous article]({% post_url
  2016-03-22-how-to-create-a-simple-slack-bot-in-nodejs %}) and it's able to schedule new events in our company calendar as shown in the images above.

## How does it work?
PlannerBot is a [**Slack Bot User**](https://api.slack.com/bot-users) written in Node.js. It uses a **natural language parser** to understand dates and time and **text analysis API** to understand the concepts, relations and sentiment of a sentence. When you send a message to it, the bot will try to extract as many informations as possible from it, for example date, time, subject of the action and verb tense.

The minimum informations required to schedule an event are event **title**, **date**, **time** and eventually a **duration**.

At the current state, the bot is able to understand english only.

## Technologies involved
* [Slack](https://slack.com)
* [Node.js](https://nodejs.org)
* [Chrono](https://github.com/wanasit/chrono) (A natural language date parser in JavaScript)
* [AlchemyAPI](http://www.alchemyapi.com) (Semantic Text Analysis APIs Using Natural Language Processing)

## Step 1: Install Node.js ##
If you have Node installed on your machine, you can skip this step. If not, follow the link based on your operating system:

* [OS X](https://nodejs.org/en/download/package-manager/#osx)
* [Linux](https://nodejs.org/en/download/package-manager/)
* [Windows](https://nodejs.org/en/download/package-manager/#windows)

Once you have Node & npm installed, check what version you are running:

![my-node-version]({{site.url}}/img/my-node-version.jpg)

As you can see I'm using `node v0.10.36` and `npm 1.4.28`.

----------

## Step 2: Create your Slack Bot User

When you [create your custom Bot User](https://my.slack.com/services/new/bot) in Slack, you can set a name, an icon, describe what it does and in which channels, and even a first & last name for your bot. In return you'll get a `API Token` that allows your Node.js application to send data into Slack using your new bot-identity.

----------

## Step 3: Initialize your Node application

If you are new to Node.js I recommend you to read [Learn Node.js in 90 minutes](http://rapidops.com/blog/learn-node-js-in-90-minutes/) first, otherwise please keep reading.


{% highlight bash %}
mkdir simple-slack-bot
cd simple-slack-bot
npm init
npm install node-slackr --save
npm install express --save
npm install moment-timezone --save
npm install libxmljs --save
npm install node-caldav --save
touch index.js
touch config.js
{% endhighlight %}

If any of the commands above return an error, try running the same command with `sudo` prepended.

In alternative you can initialize your project with the following [`package.json`](https://github.com/ActivateMedia/plannerbot/blob/master/package.json){:target="_blank"} or clone the entire [PlannerBot repository](https://github.com/ActivateMedia/plannerbot.git)

Here's the content of the `package.json`:

```
{
  "name": "plannerbot",
  "version": "0.0.1",
  "description": "Activate Media PlannerBot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ActivateMedia/plannerbot.git"
  },
  "keywords": [
    "planner",
    "slack"
  ],
  "author": "Andrea Falzetti <andrea@activate.co.uk>",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/ActivateMedia/plannerbot/issues"
  },
  "homepage": "https://github.com/ActivateMedia/plannerbot#readme",
  "dependencies": {
    "alchemy-api": "^1.3.1",
    "body-parser": "^1.15.0",
    "cb": "^0.1.0",
    "chrono-node": "^1.1.5",
    "express": "^4.13.4",
    "libxmljs": "^0.17.1",
    "moment-timezone": "^0.5.1",
    "node-cache": "^3.2.0",
    "node-slackr": "^0.1.2",
    "slackbots": "^0.5.1"
  }
}
```
