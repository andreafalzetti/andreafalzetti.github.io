---
layout: post
title: 'Get events from CalDAV in Javascript and Node.js'
subtitle: 'that interacts with a CalDAV calendar'
date: 2016-03-22 09:00:00
categories: blog development
tags: nodejs caldav slack bot
author:     "Andrea Falzetti"
header-img: "img/post-bg-04.jpg"
---

In the last weeks I have been working on an interesting project at [Activate Media](http://activatemedia.co.uk), about **bots** and one of the first bot I have created is **[PlannerBot](https://github.com/ActivateMedia/planner-server)**. It's already a great member of our team that every morning reminds to the team about all the events happening on that day and also it helps us in schedling new events thanks to a text recognition API.

If you are interested in knowing how I have implemented PlannerBot, you can read my article about it. In this post, I just want to share with you my experience with the CalDAV protocol.

Before starting this project, I didn't have an idea of how this protocol would work, now I have much clearer ideas of how to interact with a CalDAV server. If you are in the same situation, I'm sure this post will help you a little.

One of the most satisfying things you can do is retrieve all the events for a specific day or period of time. To do this, you need to make an `HTTP/REPORT` call to the server. Yes, **REPORT** is an HTTP verb, part of the [RFC 3253](http://ietf.org/rfc/rfc3253).

Retrieve events f
<script src="https://gist.github.com/andreafalzetti/c6230f801c0f8d302a7d.js"></script>

The code in the gist is mainly coming from [node-caldav](https://www.npmjs.com/package/node-caldav). I had to modify it to match my service provider (Fastmail), so in case you're having problems parsing your server's response, check out their implementation [here](https://github.com/jachwe/node-caldav).

To add an event to the calendar, you need to send an `HTTP/PUT` request to your CalDAV server appending the ID of your event. Example: `https://caldav-server.../andrea-at-the-doctor`.

<script src="https://gist.github.com/andreafalzetti/de1c0825b36940be5c75.js"></script>


If you are creating something with **Node.js**, you may be interested in my forked version of [node-caldav](https://github.com/andreafalzetti/node-caldav) on GitHub. My version of this package is not part of npm, but you can easily get integrate it into your project running from your the _node_modules_ folder on the terminal:

`git clone https://github.com/andreafalzetti/node-caldav`

In your index.js file you can add:

`var caldav = require("node-caldav");`

Please note that your `package.json` file will no be updated with the dependency because you are not going throught the official packages repository, but for the moment I'm not planning to push this package out.