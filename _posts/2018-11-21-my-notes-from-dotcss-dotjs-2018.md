---
layout: post
comments: true
title: 'My notes from dotCSS & dotJS 2018'
date: 2018-11-21
categories: blog
tags:
author: 'Andrea Falzetti'
header-img: 'img/2018/11/dotjs-2018.png'
crosspost_to_medium: true
---

For the third year in a row I have attended the largest JavaScript conference in Europe: [dotJS](https://www.dotjs.io/). This time I travelled with my amazing collagues from [DAZN](https://engineering.dazn.com/) and we had a blast!

In this short blog post I want to share a few of the things that I learnt during the event which I think it's worth sharing with you.

## Variable fonts

![grass-variable-fonts-gif]({{site.url}}/img/2018/11/grass-variable-fonts.gif)

[View the source in CodePen](https://codepen.io/mandymichael/pen/YYaWop/?editors=0100)

### What's a variable font?

> Variable fonts are an evolution of the [OpenType](https://en.wikipedia.org/wiki/OpenType) font specification that enables many different variations of a typeface to be incorporated into a single file, rather than having a separate font file for every width, weight, or style. They let you access all the variations contained in a given font file via CSS and a single @font-face reference. _Read more: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts/Variable_Fonts_Guide)_

This will enable designers and frontend developers to build really personalised experiences and interesting UIs with fancy effects! Accessibility can also benefit from variable fonts! Be warned, the CodePen above will most likely trigger your laptop fans to keep the processor cool 😂

If you want to learn more about it, I've collected some useful links:

- **[Variable Fonts - Supercharged](https://www.youtube.com/watch?v=B42rUMdcB7c)**
- **[medium.com/@clagnut/get-started-with-variable-fonts](https://medium.com/@clagnut/get-started-with-variable-fonts-c055fd73ecd7)**
- **[v-fonts.com](https://v-fonts.com/)** - A simple resource for finding and trying variable fonts

## The State of JavaScript 2018

![state-of-js-2018]({{site.url}}/img/2018/11/state-of-js-2018.png)

> We surveyed over 20,000 JavaScript developers to figure out what they're using, what they're happy with, and what they want to learn. And the result is a unique collection of stats and insights that will hopefully help you make your own way through the JavaScript ecosystem.

Figures are clear, JavaScript is growing along side with the satisfaction level of the developers using it.

Although, we all know the effort needed to cope with the JavaScript fatigue, we have the advantage of having a huge ecosystem of open source projects and great tooling today to build our JavaScript applications. I suggest you to use the results of te _StateOfJs_ survey has a tool to help you decide what to learn, adopt or simply try for your next JavaScript project.

Interested in the stats? Check out [2018.stateofjs.com](https://2018.stateofjs.com) 🚀

## Best of JS

This is another tool that comes in handy when you are not sure about what npm module to pick or what's the next big thing to learn, this website lists all sort of JavaScript libraries, frameworks, learning resources, books for you to easily find the right tool for the job.

Next time you need a library to deal with dates, or a React Component for animations, or a Node.js API framework, or simply just to stay up to date with latest released projects, consider paying a visit to [bestofjs.org](https://bestofjs.org)

## webhint

> webhint is a linting tool that will help you with your site's accessibility, speed, security and more, by checking your code for best practices and common errors. Use the online scanner or the CLI to start checking your site for errors.

Similar to Google Lighthouse, Microsoft **webhint** can analyse your website and give you hints for improvements around accessibility, performance, security and more. It also has a CLI and it integrates with Visual Studio Code so you can get you code statically scanned by webhint while you are coding!

[Try the online scanner](https://webhint.io/#scanner-input) or run webhint from your CLI: `npx hint https://example.com`

## otto

> A JavaScript interpreter in Go

This feels very experimental but if you ever need to run JavaScript in a Go project, you know what to use.

    vm := otto.New()
    vm.Run(`
        abc = 2 + 2;
        console.log("The value of abc is " + abc); // 4
    `)

Repository: [github.com/robertkrimen/otto](https://github.com/robertkrimen/otto)

## deno

> A secure TypeScript runtime on V8

Deno is a JavaScript runtime, or I should better say TypeScript runtime as it natively supports TypeScript. By the creator of the most popular JavaScript runtime Node.js, Ryan Dahl, **deno** is a project that aims to address all the regrets that Ryan has with Node.js.

He presented the project during this talk: [10 Things I Regret About Node.js - Ryan Dahl - JSConf EU 2018](https://www.youtube.com/watch?v=M3BM9TB-8yA&vl=en) and I find fascinating his motivation and hard work to put this together.

Compared to Node.js, deno is still under development but we already know that it has no `package.json` neither `npm` and it's explicitly not compatible with Node.

If you want to know more about **deno** or the thoughts behind it, check these out:

- [**Ryan Dahl is fixing his Node.js design regrets with Deno**](https://jaxenter.com/ryan-dahl-fixing-node-deno-146190.html)
- [**10 Things I Regret About Node.js** - Ryan Dahl - JSConf EU 2018](https://www.youtube.com/watch?v=M3BM9TB-8yA&vl=en)
- [github.com/denoland/deno](https://github.com/denoland/deno)


<!-- Node isolated vm -->
<!-- Event loop lag -->
<!-- Rust -->
<!-- Deno runtime -->
<!-- https://jaxenter.com/ryan-dahl-fixing-node-deno-146190.html -->
<!-- Ryan node modules talk -->
<!-- Static resolution yarn -->

## JavaScript beyond the web

<div style="width:100%;height:0;padding-bottom:51%;position:relative;"><iframe src="https://giphy.com/embed/l1J9J5XH5htw30uLS" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/linarf-games-l1J9J5XH5htw30uLS">via GIPHY</a></p>

The adoption of JavaScript in Desktop applications and video games has recently grown a lot. During the event, Tobias Ahlin, Experience Design Director at Mojang, the company who built Minecraft, was telling us the story of their journey in rebuilding Minecraft in JavaScript to allow players to create custom mods in plain HTML, CSS and JS, which opens the door to infinite and very interactive mods.

Such adventure it's extremely challenging, especially due to the performance and compatibility issue one may encounter but it's definitely possible and games like Battlefield 1 are proof that this is doable.

Yes, believe me or not, the user interface of Battlefield 1 is actually built using React and MobX.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Holy CRAP! Battlefield 1 is using React + MobX for the game UI 🤯😱 <a href="https://t.co/va12fBeswE">pic.twitter.com/va12fBeswE</a></p>&mdash; Kitze 🚢️ (@thekitze) <a href="https://twitter.com/thekitze/status/977491195910938624?ref_src=twsrc%5Etfw">March 24, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## http2

We all heard that **http2** is out while now and it's great. Big companies are already using it but most of us didn't have a chance to work with it yet.

It's your chance to take a look at some interesting readings and start using it:

- [**HTTP/2 is easy, just turn it on…**](https://medium.com/bbc-design-engineering/http-2-is-easy-just-turn-it-on-34baad2d1fb1)
- [**HTTP/2 Server Push with Node.js**](https://blog.risingstack.com/node-js-http-2-push/)
- [**Debugging tools for http2**](https://github.com/http2/http2-spec/wiki/Tools)

# Conclusions

Attending a JavaScript conference is always exciting for me, I have very good memories of the previous dotJS days and I love its style and the location, Paris. I hope the speakers line-up for next year to be even better with better talks!

The tickets for dotJS 2019 are already on sale for early birds. For the first time next year there will be 2 days - one with talks focused on Frontend and the following one about Backend & Language.

> Get your ticket on [2019.dotjs.io](https://2019.dotjs.io/)

# If you like attending or speaking at tech conferences...

Consider joining us at [DAZN](https://engineering.dazn.com/) as we have a budget for that!

We are building a streaming platform at scale with some of the coolest and cutting edge technologies.

We are an amazing team which is growing and looking for:

- [Frontend Developer](https://engineering.dazn.com/job/frontend-developer)
- [Backend Developer](https://engineering.dazn.com/job/backend-developer)
- [Developer Experience Engineer](https://engineering.dazn.com/job/frontend-developer)
- [SRE](https://engineering.dazn.com/job/site-reliability-engineer)
- [DevOps](https://engineering.dazn.com/job/devops-engineer)
- [QA Frontend](https://engineering.dazn.com/job/software-engineer-qa-frontend)
- [QA Backend](https://engineering.dazn.com/job/software-engineer-qa-backend)

and much more! Check out [engineering.dazn.com](https://engineering.dazn.com/) for the full list of open positions!

Feel free to DM me on [Twitter](https://twitter.com/rexromae) or [LinkedIn](https://www.linkedin.com/in/andreafalzetti) to ask more about the job. I'm more than happy to answer all your questions


Thanks for reading 😊
