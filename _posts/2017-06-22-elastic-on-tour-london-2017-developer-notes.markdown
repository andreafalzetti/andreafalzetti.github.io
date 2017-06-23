---
layout: post
comments: true
title: 'Elastic{ON} Tour London 2017'
subtitle: 'Developer notes'
date: 2017-06-22 22:00:00
categories: blog
tags: elasticsearch conference full-stack
author:     "Andrea Falzetti"
header-img: "img/2017/06/elastic-on-tour-2017-london.jpg"
crosspost_to_medium: true
---

[Elastic{ON} Tour 2017](https://www.elastic.co/elasticon/tour/2017/london) was held today in London at [The Brewery](https://www.thebrewery.co.uk/), and I had the chance to attend it. The Elastic team has done a great job in organising the event, and I would like to thank them for the beautiful day. The location and catering were great, and so was the training Lab on [Timelion](https://www.elastic.co/blog/timelion-timeline), pronounced "_Timeline_", is a Kibana module that helps to visualise time series data.

The day started with an introduction to Elastic, followed by an hands-on training on _Time Series with Timelion_ for about 45 minutes.

![elastic-tour-london-2017-timelion-android-vs-ios](/img/2017/06/elastic-tour-london-2017-timelion-android-vs-ios.jpg)

The lab material included a dataset of ~300,000 Apache logs entries. In the example above, we are comparing _iOS_ vs. _Android_ hits during the last _30 days_ with an interval of _1d_.

The query below instead plots the average amount of data downloaded from Great Britain in comparison with Ireland, over the past month.

![elastic-tour-london-2017-timelion-countries-query](/img/2017/06/elastic-tour-london-2017-timelion-countries-query.jpg)

After the lab, the Founder & CEO, [Shay Banon](http://thedudeabides.com/), took the stage and talked about their exciting journey, starting as a distributed search engine ending becoming not only that. Today, Elastic is the most popular **Search** and **Logging** solution for modern software applications.

My goal for today was to take home some general knowledge about Elasticsearch and its stack but also put my hands into the product during the lab.

Through the talks I took some notes that I think might be useful to share:

## The Elastic Stack

Four open-source components make the suite:

* **Kibana** - doing the data visualisation job
* **Elasticsearch** - distributed, JSON-based search and analytics engine
* **Logstash** -  events and logs collection pipeline
* **Beats** - lightweight agents that send data into elastic

![the-elastic-stack-thumb](/img/2017/06/the-elastic-stack-thumb.png)

## Facts
* The first version of Elasticsearch, **0.40**, was published in August 2010.
* The latest version is **5.4** but **6.0** will be released soon.
* The search engine of Elasticsearch is based on **[Apache Lucene](https://lucene.apache.org/core/)**.
* Elasticsearch is developed in **Java**.
* Kibana was originally written in **Angular JS (1.4.7)** and [earlier this year](https://github.com/elastic/kibana/issues/10271) they have migrated to **React** 15.
* The company has a distributed team in 40 countries and promotes remote work.
* Main Headquarters are in **Amsterdam** 🇳🇱, **San Francisco** 🇺🇸 and **London** 🇬🇧.

_Sources: Ask me Anything stand at the conference [Wikipedia](https://en.wikipedia.org/wiki/Elasticsearch)._

## Elastic Cloud
Elastic Cloud is the official hosted solution for Elasticsearch and Kibana. Although many of you may be familiar with AWS Elasticsearch, the two have a very different offering.

I won't go into many details as offers change all the time but what the Elastic team has told me is that AWS is 3-4 months behind with version updates and you are generally more limited in the configuration of the product.

I think it worths giving it a try also because they offer a [free trial for 14 days](https://www.elastic.co/cloud/as-a-service/signup) with no credit card required (❤️).

## Machine Learning 🍭
Earlier this year Elastic has announced the first release of machine learning features for the Elastic Stack. At the moment the main use case is **anomaly detection** but I am sure in the future we will see much more.

Please note that this feature is part of **[x-pack](https://www.elastic.co/guide/en/x-pack/current/xpack-introduction.html)**, an enterprise extension that bundles advanced features such as security, alerting, monitoring, reporting, etc.

## Apache Kafka
The company founded by the creators of **[Apache Kafka](https://kafka.apache.org/)**, [confluent](https://www.confluent.io/), was one of the sponsors today. I met them, and thanks to a quick chat I found out a bit more about it. Apache Kafka is an open-source streaming platform. A typical use case is the publish / subscribe, but what caught my attention is the possibility of using Kafka as messaging bus in a microservices architecture. Find below, a couple of interesting links about this.

## Resources
Want to know more about Elastic? Here some useful (I hope)
links:

* [More dates for the Elasti{on} Tour](https://www.elastic.co/elasticon/updates)
* [dotScale 2013 - Shay Banon - Why we built ElasticSearch](http://www.youtube.com/watch?v=fEsmydn747c) - **YouTube**
* [How did Shay Banon start writing Elasticsearch?](https://www.quora.com/How-did-Shay-Banon-start-writing-Elasticsearch-How-much-knowledge-does-he-have-on-programming-stuff) - **Quora**
* [Elastic Cloud as a service](https://www.elastic.co/cloud/as-a-service) - **Elastic**
* [Elasticsearch repository](https://github.com/elastic/elasticsearch) - **GitHub**
* [Elastic Cloud !== Amazon Elasticsearch Service](https://www.elastic.co/blog/hosted-elasticsearch-services-roundup-elastic-cloud-and-amazon-elasticsearch-service)
* [Introducing Machine Learning for the Elastic Stack](https://www.elastic.co/blog/introducing-machine-learning-for-the-elastic-stack)
* [Microservices in the Apache Kafka Ecosystem](https://www.slideshare.net/ConfluentInc/microservices-in-the-apache-kafka-ecosystem)
* [An introduction to Apache Kafka and microservices communication](https://medium.com/@ulymarins/an-introduction-to-apache-kafka-and-microservices-communication-bf0a0966d63)
* _I will add the link to the slides & videos of the event as soon as they are published._

## Work with me
By the way, if you also enjoy attending conferences while working on exciting projects check out our vacant position for a [Frontend Developer at Activate](http://bit.ly/Activate-Jobs-FrontEnd).

Thanks for reading!


![elastic-tour-london-2017-gadgets](/img/2017/06/elastic-tour-london-2017-gadgets.jpg)
