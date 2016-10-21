---
layout: post
comments: true
title: 'Randomize variables in a string in javascript'
subtitle: 'using pipe and square brakets'
date: 2016-10-21 12:15:00
categories: blog
tags: nodejs javascript snippets
author:     "Andrea Falzetti"
header-img: "img/post-bg-01.jpg"
---

## Challenge
I have a string that looks like:

`[Hi|Hello|Hey] ${user.name}! Would you like to [go for a walk|to the park]?`

I need to render the text randomising the action (_go for a walk_ **or** _to the park_) so that the message looks slightly different every time that is sent. Each block of square brackets could contain _N_ variables (eg. `[walk|run|swim|play tennis]`) and each message can contain multiple blocks of random substrings.

I wrote a little snippet to do it, so feel free to use it:

{% highlight Javascript %}
Conversation.prototype.randomizeMessage = function(message) {    
    const pattern = /\[(.*?)\]/g;
    const matches = message.match(pattern);
    if(matches) {
        matches.map((match) => {
            const items = match.substring(1, match.length-1).split('|');
            const randomItem = items[Math.floor(Math.random()*items.length)];
            message = message.replace(match, randomItem);
        });
    }
    return message;
}
{% endhighlight %}

**GitHub Gist** available [here](https://gist.github.com/andreafalzetti/2d90bc57dcdcaf1fde4dedd9361f1f93).

Output Example:

* `Hello,` Andrea! Would you like to go `to the park`?
* `Hi` Andrea! Would you like to go `for a walk`?
* `Hello` Andrea! Would you like to go `for a walk`?
* `Hey` Andrea! Would you like to go `to the park`?
