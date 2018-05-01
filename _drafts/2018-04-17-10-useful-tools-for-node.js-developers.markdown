---
layout: post
comments: true
title: 'My favourite developer tools'
subtitle: ''
date: 2018-04-17
categories: blog
tags:
author: 'Andrea Falzetti'
header-img: 'img/post-bg-01.jpg'
---

Wheter you are working on the back-end or the front-end, you spend a lot of time using or looking for tools jor to get your job done.

Today I want to share with you, the name of the tools that I use every single day.

I will let images speak when possible to keep it quick!

**tldr**: *Jump right at the bottom for names and links.*

<!-- tldr -->

## 1. Silver searcher
### Search through code faster
`$ ag`
YAML

## 2. jq, yq, xq
#### Handle JSON, YAML and XML in you cli

`jq`, `yq` and `xq` are command line tools that allow you dealing with JSON, YAML and XML documents directly from your shell. If you haven't seem them before you may ask why someone would want to look at some JSON in the terminal?

Well, most of the time these tools are used in scripts to parse and ex of data from APIs.

In the examples below I hit a public API that returns countries VAT:

![jq-example]({{site.baseurl}}/img/2018/04/jq-1.png)

Using jq

![jq-example]({{site.baseurl}}/img/2018/04/jq-2.png)

And filter out
![jq-example]({{site.baseurl}}/img/2018/04/jq-3.png)

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

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ac hendrerit lorem. Integer eu sagittis nisi. Nullam suscipit dictum magna ut auctor. Donec a sapien elit. Suspendisse vitae sodales est. Cras in placerat purus. Fusce quis nulla tortor. In at ornare arcu. Donec tempor nec leo venenatis consequat. Aenean suscipit sem bibendum, egestas nunc vitae, dictum ex.

### 3. HTTPie
#### A friendly command line HTTP client

> Its goal is to make CLI interaction with web services as human-friendly as possible. It provides a simple http command that allows for sending arbitrary HTTP requests using a simple and natural syntax, and displays colorized output. HTTPie can be used for testing, debugging, and generally interacting with HTTP servers.

As you can see in the image below, I am hitting a public weather API to get the London's current weather, the command I have ran is:

```
$ http https://www.metaweather.com/api/location/search/?query\=london
```

![httpie-example]({{site.baseurl}}/img/2018/04/httpie.png)

You can achieve the same result using a combination of commands, **curl** and **jq**, mentioned above.

![curl-jq]({{site.baseurl}}/img/2018/04/curl-jq.png)

I personally use both approaches, but I go for HTTPie when I don't remember how to do something with curl. I must have googled "_curl post json_", 100 times 😂

With HTTPie I simply write to stdout and it will pick it up:

```shell
$ echo '{"name": "John"}' | http PATCH example.com/person/1 X-API-Token:123
```

```shell
$ http PUT example.com/person/1 X-API-Token:123 < person.json
```

```shell
$ http PATCH example.com/person/1 X-API-Token:123 <<< '{"name": "John"}'
```

It's easy as that! You can specify what HTTP method that you want to use (PUT, POST, PATCH, etc) after the _http_ and pass any custom header after the URL, using the _key:value_ notation.

* [Get HTTPie](https://httpie.org/)

### 4. choosy
#### Open every link in the right browser

Front-end developers and QA engineers will particularly like this! [Choosy](https://www.choosyosx.com/) lets you pick what browser to use when you click on a link.

![choosy]({{site.baseurl}}/img/2018/04/choosy.gif)

I like it because it's lightweight, smart and **not intrusive**. For instance it won't prompt you to choose a browser if you are already in one, or it will not display browsers that are not open, this means if you keep your favourite one on, you won't need to decide every time, choosy will use that.

It comes very handy when you need to open a link from the Terminal or within an Email, Slack, Trello etc.

I personlly use three or four browsers (including [Brave](https://brave.com/)) for different purposes, so if you are like me, you'll really like this one. Choosy also supports Chrome profiles and incognito so if you need to test a website under different sessions / users, it can really save you some time!

![choosy]({{site.baseurl}}/img/2018/04/choosy.png)

* [Get Choosy](https://www.choosyosx.com/)

### 5. Spectacle
#### Manage your OS X windows like a pro

Ut in magna condimentum, rutrum est sed, tempus nulla. Donec vestibulum massa viverra, cursus magna ac, imperdiet magna. In sit amet nunc luctus tortor accumsan condimentum nec porttitor lorem. Nunc iaculis, mauris id auctor gravida, dui odio condimentum dui, fermentum bibendum leo orci porttitor augue.

### 6. trailer
#### Stay up to date on GitHub

Suspendisse potenti. Vivamus cursus condimentum mattis. Maecenas sed diam enim. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse ut erat vel urna semper tempus. Curabitur ut euismod dui. Maecenas feugiat purus nec tristique viverra. Maecenas in lectus ligula. Phasellus vestibulum arcu a elit iaculis commodo.

### 7. jira (zsh plugin)

Most of us use **Jira** these days, so why not having a little helper.

![plugin-jira]({{site.baseurl}}/img/2018/04/plugin-jira.gif)

You can also run `jira new` to quickly create a new ticket!

* [Get **jira**](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/jira)


### 8. shpotify
#### why should we leave the terminal?

If you are a Spotify user you may find the next one useful.

This utility allows you to *play/stop* , *search* for songs or playlists, *skip*, adjust the *volume*, and more.

![plugin-shpotify]({{site.baseurl}}/img/2018/04/plugin-shpotify.gif)

* [Get **shpotify**](https://github.com/hnarayanan/shpotify)

markdown + alias
jira


### 9. now
#### one-command deployments

`now` allows you to deploy to the cloud any project that has `package.json` or `Dockerfile`.

I am not a power user but I want to recommend it because it helped me a few times during prototyping or when I didn't have time to build an own infrastracture (e.g. hackathons), you really want to use `now`.

* [Get **now**](https://now.sh/)

### 10. Dash
#### Offline documentation

* [**Dash**](https://kapeli.com/dash) is an API documentation and code snippets manager.

Documentation for a load of frameworks and libraries have been imported, and it works offline.

They have also introduced cheat sheets for shortcuts and useful commands (e.g. `vim`, `Kubernetes`, etc).

![dash]({{site.baseurl}}/img/2018/04/dash.png)

* [Get **Dash**](https://kapeli.com/dash)


### 11. duet
#### Use your iPad or iPhone as external screen

When the office runs out of screens or your are at your favourite café, plug your iPad into your Mac and start [duet](https://www.duetdisplay.com/). This app, built by ex-Apple engineers, allow all iPads and iPhone with iOs 7.0+ to become proper second screens that you can manage from the Displays settings of your mac.

* [Get Duet](https://www.duetdisplay.com/)


**TL;DR**

* [Silver searcher](https://github.com/ggreer/the_silver_searcher)
* [jq, yq, xq](https://stedolan.github.io/jq/)
* [HTTPie](https://httpie.org/)
* [Choosy](https://www.choosyosx.com/)
* [Spectacle](https://www.spectacleapp.com/)
* [Trailer](https://github.com/ptsochantaris/trailer)
* [**jira**](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/jira)
* [**shpotify**](https://github.com/hnarayanan/shpotify)
* [**now**](https://now.sh/)
* [**Dash**](https://kapeli.com/dash)
* [duet](https://www.duetdisplay.com/)

That's it!

I hope you find them useful, if you want to recommend a tool that I haven't included, please comment below.