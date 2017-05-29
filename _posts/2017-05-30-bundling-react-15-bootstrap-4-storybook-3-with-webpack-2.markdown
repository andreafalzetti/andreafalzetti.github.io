---
layout: post
comments: true
title: 'Bundling React 15, Bootstrap 4, Storybook 3 with Webpack 2'
crosspost_to_medium: true
subtitle: 'With few alpha versions'
date: 2017-05-23 09:00:00
categories: blog
tags: javascript, react, storybook, webpack, bootstrap, sass
author:     "Andrea Falzetti"
header-img: "img/post-bg-11.jpg"
---

How many times did it happen to you that you were debugging some code and at the end of the day you didn't manage to find a solution? How frustrating is that?

Good news is, you will fell so much better when you find the solution to your issue and everything will look easier. Your skills have just levelled up.

Today, it was one of those days for me. I have spent long hours trying to make something work, and I eventually found a solution, so I thought it was a good thing to share it with the community.

## Challenge

I'm building a new React app and I have been using [react-redux-starter-kit](https://github.com/davezuko/react-redux-starter-kit) for a couple of ReactJS projects now, and I really like it. A few days ago they released an update which brings `React 15.5.4`, `Webpack 2.5.1` and last but not least `Bootstrap 4.0.0-alpha`. When I saw this update, I had just started a new project, like, the week before, and I thought it could be worth it spending a few hours merging their changes, well I did it, and I am very happy now with the outcome.

If you are a fan of Storybook you know that the current version does not work well with Webpack 2 so I started looking around for a solution, but I could find one. Thanks to [this](https://github.com/storybooks/storybook/issues/1046#issuecomment-304324567) GitHub issue I realised that they are working on a major update which will support the latest version of Webpack and will be out soon.

Let me summarise you my journey.

## Ingredients

1. react-redux-starter-kit [<li><a href="{{ site.baseurl }}/index.html"><i class='fa fa-github'></i> Home</a></li>](https://github.com/davezuko/react-redux-starter-kit)
1. bootstrap v4.0.0-alpha [<li><a href="{{ site.baseurl }}/index.html"><i class='fa fa-github'></i>](https://github.com/twbs/bootstrap/tree/v4-npm)
1. storybook 3 alpha (rc2) [<li><a href="{{ site.baseurl }}/index.html"><i class='fa fa-github'></i>](https://github.com/storybooks/storybook/issues/1046#issuecomment-304360179)
1. reactstrap [<li><a href="{{ site.baseurl }}/index.html"><i class='fa fa-github'></i>](https://github.com/reactstrap/reactstrap)

You can get all of them bundled in the [repository](https://github.com/andreafalzetti/react-redux-starter-kit) that I have forked for this purpose.

## Bootstrap SASS

Let's discuss about CSS and styles. At [work](http://activate.co.uk) we have been using Bootstrap for many years now. We initially approached it using the pre-bundled CSS version, later we introduced LESS, and at that point, we were able to include in the bundle only the components that we actually needed. Now that Bootstrap has moved to SASS we think it's the good time for us to switch too.

For this reason, I was so euphoric to see that the starter-kit that I have chosen has decided to embrace Bootstrap too, which means that I finally have the chance to work with the latest version of Bootstrap: **4**.

Although Bootstrap 4 is still in alpha version - it seemes stable enough for us to start using it, especially because [reactstrap](https://reactstrap.github.io/) appears to support it well and it has good support.

## Storybook

I found out about Storybook during the last [React London Meetup](https://www.youtube.com/watch?v=UxbQ-cGnoCE&index=1&list=PLW6ORi0XZU0BL3Up9mXpP75ilJBDOjMsQ) at Facebook, and I immediately fall in love with it. If it's the first time you hear about it, I can tell that it fits very well in our development workflow at Activate, where I build some React components and a designer can focus on styling them without worrying about the JavaScript code. Storybook gives a quick visual feedback helping us building and testing more efficiently.

Good news for you is, a new version of Storybook (3.0) will be out soon, and if you are a Webpack 2 user, the integration between those two will be much smoother.

#### Dynamically loaded stories

I want my Storybook Stories to live within the component folder, so my approach was to load the stories dynamically as explained in the [documentation](). You just need to change a few lines in the Storybook configuration file, as follows:

```js
// ./storybook/config.js
import { configure } from '@storybook/react';

const req = require.context('../src/components', true, /\.stories\.js$/)

function loadStories() {
  require('../stories');
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
```

Then, create a stories container file in your component. For instance, I have created five stories for my component, each representing a different state.

```js
// ./src/components/MyBeautifulButton/MyBeautifulButton.stories.js
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import MyBeautifulButton from './MyBeautifulButton'

const Story = ({ name, icon }) => (
  <MyBeautifulButton name='Test' icon='user' />
);

Story.propTypes = {
  name: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired
};

storiesOf('MyBeautifulButton', module)
  .add('Incomplete', () => (
    <MyBeautifulButton name="User" icon="user" status='0' />
  ))
  .add('Started', () => (
    <MyBeautifulButton name="User" icon="user" status='50' />
  ))  
  .add('Next', () => (
    <MyBeautifulButton name="User" icon="user" status='0' isNext />
  ))  
  .add('Completed', () => (
    <MyBeautifulButton name="User" icon="user" status={100} />
  ))
  .add('Disabled', () => (
    <MyBeautifulButton name="User" icon="user" disabled={true} />
  ));
```

### Output

![storybook-3-result]({{site.baseurl}}/img/2017/05/storybook-3-state-started.jpg)

![storybook-3-result]({{site.baseurl}}/img/2017/05/storybook-3-state-completed.jpg)

![storybook-3-result]({{site.baseurl}}/img/2017/05/storybook-3-bootstrap-buttons.jpg)

## Customise Bootstrap

I consider a best practice chaining the SASS variables that Bootstrap uses to build the CSS instead of doing an override of the class style that we want to change. For instance, the height and background colour of the navbar can be easily changed assigning new values to the SASS variables that Bootstrap will use in its core files:

```
$navbar-height: 150px;
$navbar-default-bg: $brand-primary;
```

It is also very handy assigning new brand colours, to use across the stylesheets:

```
$brand-primary:         #58C7D6 !default; // Blue
$brand-success:         #75C158 !default; // Green
$brand-info:            #E6BE31 !default; // Yellow
$brand-warning:         #ee7e2d !default; // Orange
$brand-danger:          #d9534f !default; // Red
```

You don't want to touch the original Bootstrap files, so you can create a file in your assets (e.g. `/styles/_bootstrap.scss`) and place there all the variables you wish to change.

It will be enough importing this file before the Bootstrap one in the `main.scss` file, to make the magic:

```
@import 'base';
@import "bootstrap.scss";
@import '~bootstrap/scss/bootstrap.scss';

// Some best-practice CSS that's useful for most apps
// Just remove them if they're not what you want
html {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}
```

## Conclusions

I hope that with this post I made clear the followins thoughts:

* Bootstrap 4 will be out soon, let's start looking into it
* SASS rocks
* Storybook is cool
* Storybook works with Webpack 2
* React is great and JavaScript is a LOT of fun
* When you have one of those days, just keep on, solution will arrive.

## Work with me
By the way, if you also love using cutting edge technologies to solve new real world challenges every day check out our vacant position for a [Frontend Developer at Activate](http://bit.ly/Activate-Jobs-FrontEnd), our startup studio needs you!

Thanks for reading!
