---
layout: post
comments: true
title: 'Tools to boost your DX'
subtitle: 'DX = Developer Experience'
date: 2018-10-25
categories: blog
tags:
author: 'Andrea Falzetti'
header-img: 'img/2018/10/hammer-hand-tools-measuring-tape-lite.jpg'
---

Wheter you are working on the back-end or the front-end, having the *right tool for the job*, can really make a difference some times.

With this blog post, I want to share with you some of the tools that I use pretty much every day and I believe can be useful to any software developer.

**TL;DR**

* [**jq, yq, xq**](https://stedolan.github.io/jq/)
* [**HTTPie**](https://httpie.org/)
* [**Choosy**](https://www.choosyosx.com/)
* [**Ag**](https://github.com/ggreer/the_silver_searcher)
* [**Trailer**](https://github.com/ptsochantaris/trailer)
* [**jira**](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/jira)
* [**shpotify**](https://github.com/hnarayanan/shpotify)
* [**now**](https://now.sh/)
* [**Dash**](https://kapeli.com/dash)
* [**duet**](https://www.duetdisplay.com/)

------

## 1. jq, yq, xq
#### Handle JSON, YAML and XML in the terminal

`jq`, `yq` and `xq` are command line tools that allow you dealing with JSON, YAML and XML documents directly from your shell. If you haven't seen them before you may ask why someone would want to look at some JSON in the terminal?

Well, most of the time they are used in scripts, generally piped to `curl` or `http` (see the second tool) to parse and extract data from API calls.

In the examples below I hit a public API that returns countries VAT. This is the output of a GET (all countries) without using jq.

![jq-example]({{site.baseurl}}/img/2018/04/jq-1.png)

**jq** has some built-in operators we can use to count, select, filter and much more. In the following example I simply count how many items the `.rates` array has.

![jq-example]({{site.baseurl}}/img/2018/04/jq-2.png)

Here we search the array for a specific item that contains a property `country_code` that equals `GB`. This gives us back the whole item.

![jq-example]({{site.baseurl}}/img/2018/04/jq-3.png)

We can finally exctract the values that we need and use them in a bash script!

![jq-example]({{site.baseurl}}/img/2018/04/jq-4.png)

Here are the commands I have used above, feel free to experiment with them:

```shell
# 1
http https://jsonvat.com

# 2
http https://jsonvat.com | jq ".rates | length"

# 3
http https://jsonvat.com | jq -r ".rates[] | select(.country_code | contains (\"$COUNTRY\")) | .periods[0].rates.standard"

#4
COUNTRY='GB'
VAT=$(http https://jsonvat.com | jq -r ".rates[] | select(.country_code | contains (\"$COUNTRY\")) | .periods[0].rates.standard")
echo "VAT in $COUNTRY is $VAT%"
```

### 2. HTTPie
#### A friendly command line HTTP client

> Its goal is to make CLI interaction with web services as human-friendly as possible. It provides a simple http command that allows for sending arbitrary HTTP requests using a simple and natural syntax, and displays colorized output. HTTPie can be used for testing, debugging, and generally interacting with HTTP servers.

As you can see in the image below, I am hitting a public weather API to get the London's current weather, the command I have ran is:

![httpie-example]({{site.baseurl}}/img/2018/04/httpie.png)

You can achieve the same result using a combination of commands, **curl** and **jq**, mentioned above.

![curl-jq]({{site.baseurl}}/img/2018/04/curl-jq.png)

I personally use both approaches, but I use `http` when I can't remember how to do some specific requests using `curl` and I'm too lazy to check the manual. I must have googled "_curl post json_" hundreds of times 😂

With HTTPie I remember I can use few approaches such as stdout, files or [here strings](https://www.tldp.org/LDP/abs/html/x17837.html).

```shell
# stdout
echo '{"name": "John"}' | http PATCH example.com/person/1 X-API-Token:123

# From a file
http PUT example.com/person/1 X-API-Token:123 < person.json

# Using here strings
http PATCH example.com/person/1 X-API-Token:123 <<< '{"name": "John"}'
```

It's easy as that!

You can specify the **HTTP method** (PUT, POST, PATCH, etc) before the URL and passing _Headers_ is also straightforward, just add `Key:Value` pairs after the URL, they will become part of the HTTP request headers.

* [Get HTTPie](https://httpie.org/)

### 3. choosy
#### Open every link in the right browser

Front-end developers and QA engineers will particularly like this! [Choosy](https://www.choosyosx.com/) lets you pick what browser to use when you click on a link.

![choosy]({{site.baseurl}}/img/2018/04/choosy.gif)

I like it because it's lightweight, smart and **not intrusive**. For instance it won't prompt you to choose a browser if you are already in one, or it will not display browsers that are not open, this means if you keep your favourite one on, you won't need to decide every time, choosy will use that.

It comes very handy when you need to open a link from the Terminal or within an Email, Slack, Trello etc.

I personlly use three or four browsers (including [Brave](https://brave.com/)) for different purposes, so if you are like me, you'll really like this one. Choosy also supports Chrome profiles and incognito so if you need to test a website under different sessions / users, it can really save you some time!

![choosy]({{site.baseurl}}/img/2018/04/choosy.png)

* [Get Choosy](https://www.choosyosx.com/)

## 4. Ag
### Search through code faster

Also called _The Silver Searcher_, it's a tool like `grep` but optimized for developers.

When you search, it ignores by default files in `.gitignore`, for JavaScript developers is so convenient because it means you don't have to manually exclude the `node_modules` folder.

<p align="center"><iframe src="https://giphy.com/embed/l4HodBpDmoMA5p9bG" width="480" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></p>

I also like that the output it's nice and clear:

![ag]({{site.baseurl}}/img/2018/04/ag.png)

* [Get Ag](https://github.com/ggreer/the_silver_searcher)


### 5. trailer
#### Stay up to date on GitHub

[Trailer](https://github.com/ptsochantaris/trailer) is an open-source app that brings GitHub notifications in your desktop. There are two sections, **issues** and **pull requests**.

Rather than looking at emails or checking the website I prefer to to receive a push notification when someone opened or reviewed a pull request.

![trailer]({{site.baseurl}}/img/2018/04/trailer-1.png)

Once expanded, you can see the notifications history and jump directly at them if you like.

![trailer]({{site.baseurl}}/img/2018/04/trailer-2.png)

If you are scared to receive hundreds of notifications with this, don't worry! You can decide on what repositories you want to be notified.

![trailer]({{site.baseurl}}/img/2018/04/trailer-3.png)

### 6. jira (zsh plugin)

Most of us use **Jira** these days, so why not having a little helper.

![plugin-jira]({{site.baseurl}}/img/2018/04/plugin-jira.gif)

You can also run `jira new` to quickly create a new ticket!

* [Get **jira**](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/jira)

### 7. shpotify
#### why should we leave the terminal?

If you are a Spotify user you may find the next one useful.

This utility allows you to *play/stop* , *search* for songs or playlists, *skip*, adjust the *volume*, and more.

![plugin-shpotify]({{site.baseurl}}/img/2018/04/plugin-shpotify.gif)

* [Get **shpotify**](https://github.com/hnarayanan/shpotify)

### 8. now
#### one-command deployments

`now` allows you to deploy to the cloud any project that has `package.json` or `Dockerfile`.

I am not a power user but I want to recommend it because it helped me a few times during prototyping or when I didn't have time to build an own infrastracture (e.g. hackathons), you really want to use `now`.

* [Get **now**](https://now.sh/)

### 9. Dash
#### Offline documentation

* [**Dash**](https://kapeli.com/dash) is an API documentation and code snippets manager.

Documentation for a load of frameworks and libraries have been imported, and it works offline.

They have also introduced cheat sheets for shortcuts and useful commands (e.g. `vim`, `Kubernetes`, etc).

![dash]({{site.baseurl}}/img/2018/04/dash.png)

* [Get **Dash**](https://kapeli.com/dash)


### 10. duet
#### Use your iPad or iPhone as external screen

When the office runs out of screens or your are at your favourite café, plug your iPad into your Mac and start [duet](https://www.duetdisplay.com/). This app, built by ex-Apple engineers, allow all iPads and iPhone with iOs 7.0+ to become proper second screens that you can manage from the Displays settings of your mac.

* [Get Duet](https://www.duetdisplay.com/)

That's it!

I hope you find them useful, if you want to recommend a tool that I haven't included, please comment below.

Photo by [energepic.com](http://www.energepic.com/tools-on-a-workbench/)
