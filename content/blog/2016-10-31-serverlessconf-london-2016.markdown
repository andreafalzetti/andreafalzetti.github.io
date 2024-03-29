---
author: Andrea Falzetti
categories:
  - blog
date: "2016-10-31T23:00:00Z"
description: comments on the conference
tags: 
  - conference
  - aws 
  - serverless
  - london
title: Serverlessconf London 2016
aliases:
    - /blog/2016/10/31/serverlessconf-london-2016.html
    - /blog/2016/10/31/Serverlessconf-London-2016/
---

## ServerlessConf London 2016 <i class="em em-zap"></i>
First of all, I have to thank the [@AWSUserGroupUK](http://awsuguk.org) meetup group for giving me the great opportunity to join this amazing conference.

It has been the <i class="em em-three"></i>rd edition of the [ServerlessConf](http://serverlessconf.io), the first was held in New York <i class="em em-us"></i>, the second in Tokyo <i class="em em-jp"></i> and this in London <i class="em em-uk"></i>.

The main sponsor was _certainly_ Amazon so we have seen a lot of AWS stuff but besides sponsoring the event they have also done most of the effort so far in providing serverless solutions to the market. Other players such as Microsoft, Google and IBM are following with their products.

## OpenWhisk
IBM has presented their <i class="em em-cloud"></i> event-based platform which allows to trigger and run serverless functions. An interesting fact is that the platform is mainly built in [**Scala**](http://www.scala-lang.org/) and they used Node.js to prototype it. They explained the reason behind the decision of moving from Node to Scala for production and it's because they believe Scala is more reliable than Node (ok, it's time for me to look into Scala <i class="em em-grimacing"></i>). It's worth knowing that OpenWhisk is the only solution at the moment supports multiple languages such as Node, Swift and anything you can wrap in a Docker image, as they are able to run Docker images for you.

<i class="em em-cinema"></i> Talk: [_OpenWhisk Under the Hood - Stephen Fink_](https://www.youtube.com/watch?v=S-fY1exdbao&list=UUqlcVgk8SkUmve4Kw4xSlgw)

## Azure functions
Microsoft had a very interactive demo while presenting their product, [**Azure functions**](https://azure.microsoft.com/en-gb/services/functions/) and [**WebJobs**](https://azure.microsoft.com/en-gb/documentation/articles/web-sites-create-web-jobs/). A web interface and a command line tool allow to deploy and test serverless functions, pretty cool.

<i class="em em-cinema"></i> Talk: [_The making of Azure Functions - Chris Anderson_](https://www.youtube.com/watch?v=yJ9KnTw1kyc&list=UUqlcVgk8SkUmve4Kw4xSlgw)

## Google Cloud Functions
Google as well has lunched a Lambda-like service called Google Cloud Functions, they had a talk (which I have unfortunately missed) but you can read more about their product, [here](https://cloud.google.com/functions/).

<i class="em em-cinema"></i> Talk: [_Serverless Microservices with Google Cloud Functions - Bret McGowen_](https://www.youtube.com/watch?v=BybYim0HRmY&list=PLnwBrRU5CSTmM4OsUzDaog2pqadQSxKBv)

## The Workshop
There were other two workshops but I chose "**Building a Serverless Messenger Bot on AWS Using the Messenger Platform and the Serverless Framework**" hosted by [Mikael Puittinen](https://twitter.com/mpuittinen) the CTO of [SC5](http://sc5.io) and [Eetu Tuomala](https://twitter.com/hopeatussi), they introduced us to [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html), the [serverless framework](https://serverless.com/) and we managed to create a serverless Messenger Bot using their boilerplate which is open source and available [here](https://github.com/SC5/serverless-messenger-boilerplate).

They designed the workshop in order to have us coding as less as possible and they achieved it especially using [Wit.ai](http://wit.ai) which provides an easy way for designing conversation flows using stories and machine learning. I already had some experience on this because when Facebook released the Messenger API I have implemented a [LyricsBot](https://github.com/andreafalzetti/FB-LyricsBot) for fun and few months before I have used Wit.ai to [create a smart Slack Bot in Node.js]({% post_url 2016-03-22-how-to-create-a-simple-slack-bot-in-nodejs %})
 that we use at [Activate](http://activate.co.uk), as explained in [this article](https://medium.com/@activatemedia/the-activate-bot-story-cecfc4764292).

[![bot-architecture](/img/serverlessconf-london-2016/serverless-messenger-bot.png)](https://github.com/SC5/serverless-messenger-boilerplate)

## Serverless <i class="em em-zap"></i>
It's not here to replace or pretend to be better than existing solutions, as any new technology it might be good for some and not appropriate for other cases, serverless is a way of simplifying software development. You focus on the actual business logic of your code and you forget about everything else. You write small microservices that can be 1 or 2 lambda functions and you **use services**. I particularly liked this quote from one of the talks:

> "Build Apps with Services not Servers" [@danilop](https://twitter.com/danilop)

Which, in essence, is a statement to describe serverless. When you build your next application, think about what **services** can you make serverless, so you have to focus only on the important bit, only on the important code that makes the difference in your company. You don't want to build your authentication layer anymore, you don't want to build a message bus again, you don't want to worry about installing and updating dependencies on a virtual machine, or worrying about access policies anymore.

I agree with [Charity Majors](https://twitter.com/mipsytipsy?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor), founder of [parse.com](http://parse.com) when during her talk she said that *serverless* is an **ambiguous** name that doesn't reflect the real concept behind it, because, at the end, the functions still run on servers.

With serverless architectures, we hand over the **responsibility** of running the servers. If now we are comfortable buying virtual machines that run on someone else hardware on which hosting providers install the OS and give us access to it, serverless is a step further. The provider also installs the **dependencies** and **framework** that we need in order to run our software. Ah, and they also keep it up to date, ed and secure. <i class="em em-scream_cat"></i>

## The Serverless Framework
It's a tool built in Node.js that allows developers building serverless architectures on AWS Lambda and more. It helps **provisioning**, **scaling** and **deploying** faster. It works with multiple providers including AWS, Google Cloud Functions, OpenWhisk and it's configurable with a *yaml* file. Their CTO, [Florian Motlik](https://twitter.com/flomotlik), had a very interesting talk at the conference during which he announced that a lot of features are coming soon, so it definitely worth keeping on eye this. You can read more about it on [serverless.com](https://serverless.com/). In my opinion, it's really **powerful** and absolutely necessary especially if you are using Node.js.

<i class="em em-cinema"></i> Talk: [_Getting the most out of the Serverless Framework - Florian Motlik_](https://www.youtube.com/watch?v=ygGmigMBVfI)

## Future (for me) <i class="em em-loudspeaker"></i>
I am taking the [AWS Certified Developer - Associate](https://aws.amazon.com/certification/certified-developer-associate/) course on [aCloud.guru](https://acloud.guru/courses) which I highly recommend, it's really nice and well done. Once I have a better understanding of all AWS services I might use serverless at work or in a side project.

At the same time I am watching a course about *ECMAScript6* on [ES6.io](https://ES6.io/friend/AFALZETTI	), again really good quality, if you use JavaScript you should definitely consider it.

I am also using Lambda functions to create a few skills for my Amazon Alexa, it's working fine but I am waiting for some good inspiration so I can make something useful out of it <i class="em em-grinning"></i>


## Thanks <i class="em em-end"></i>
Thanks to the organisers of the event and to all the staff at the venue!

Thanks to [Activate Media](http://activate.co.uk) for supporting me.

And also thanks for reading! If you find any typo or mistake, please send me a pull request <i class="em em-blush"></i>

## Photos and videos
[Here](https://www.youtube.com/watch?v=wJqBn9axSe4) are a short reminder video and a [VLOG](https://www.youtube.com/watch?v=dCuVBV0lPYY) of the event.

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-6.jpg)

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-7.jpg)

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-12.jpg)

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-13.jpg)

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-14.jpg)

![serverless-conf-photo](/img/serverlessconf-london-2016/serverlessconf-london-2016-15.jpg)
