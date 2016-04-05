---
layout: post
title: 'Add an event in CalDAV in Javascript and Node.js'
subtitle: ''
date: 2016-03-22 09:00:00
categories: blog development
tags: nodejs caldav slack bot
author:     "Andrea Falzetti"
header-img: "img/post-bg-04.jpg"
---

In the last weeks I have been working on an interesting project at [Activate Media](http://activatemedia.co.uk), about **bots** and one of the first bot I have created is **[PlannerBot](https://github.com/ActivateMedia/planner-server)**. It's already a great member of our team that every morning reminds to the team about all the events happening on that day and also it helps us in schedling new events thanks to a text recognition API.

If you are interested in knowing how I have implemented PlannerBot, you can read my article about it. In this post, I just want to share with you my experience with the CalDAV protocol.

Before starting this project, I didn't have an idea of how this protocol would work, now I have much clearer ideas of how to interact with a CalDAV server. If you are in the same situation, I'm sure this post will help you a little.

To add an event to the calendar, you need to send an `HTTP/PUT` request to your CalDAV server appending the ID of your event. Example:

`https://caldav-server.../andrea-at-the-doctor`.

In the example above *andrea-at-the-doctor* is the ID of the event and using the same URI, you can update your event, so it's important for your application to generate IDs that can be re-generated upon request or keep track of them.

The code is available in Javascript but you can write the HTTP request with any language.
<script src="https://gist.github.com/andreafalzetti/de1c0825b36940be5c75.js"></script>

During the development I find very useful using cURL to test the HTTP calls. Recently, I have been also using [Paw (The most advanced HTTP client for Mac)](https://luckymarmot.com/paw) a lot.


    curl -X "PUT" "https://caldav-server.../andrea-at-the-doctor" \
    	-H "Authorization: Basic XYZ" \
    	-H "Content-Type: text/calendar
    " \
    	-d $'BEGIN:VCALENDAR
    BEGIN:VEVENT
    UID:andrea-at-the-doctor
    SUMMARY:Andrea at the doctor
    DTSTART:20160326T080000Z
    DTEND:20160326T090000Z
    END:VEVENT
    END:VCALENDAR
    '

This event will start on the `26th of March 2016 08:00` and will end on the same day at `09:00`. In case of all-day events, you would make the body of your event like this:

    BEGIN:VEVENT
    UID:andrea-at-the-doctor
    SUMMARY:Andrea at the doctor
    DTSTART;VALUE=DATE:20160326
    DTEND;VALUE=DATE:20160327
    END:VEVENT
    END:VCALENDAR


If you are creating something with **Node.js**, you may be interested in my forked version of [node-caldav](https://github.com/andreafalzetti/node-caldav) on GitHub. My version of this package is not part of npm, but you can easily get integrate it into your project running from your the _node_modules_ folder on the terminal:

`git clone https://github.com/andreafalzetti/node-caldav`

In your index.js file you can add:

`var caldav = require("node-caldav");`

Please note that your `package.json` file will no be updated with the dependency because you are not going throught the official packages repository, but for the moment I'm not planning to push this package out.