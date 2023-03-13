---
author: Andrea Falzetti
categories:
  - blog
date: "2016-11-11T12:45:00Z"
description: in a ReactJS project
tags: 
  - webpack 
  - react 
  - javascript
title: How to fix broken base64 image using image-webpack and file-loader
aliases:
    - /blog/2016/11/11/how-fix-broken-base64-image-webpack-file-loader.html
    - /blog/2016/11/11/How-to-fix-broken-base64-image-using-image-webpack-and-file-loader/
---

## Challenge <i class="em em-rage4"></i>
If you are here, you are probably trying to setup webpack in order to handle your images. The problem I was experiencing and tyring to document here is, after installing **image-webpack** and **file-loader** and using `<img src={require('logo.png')}/>` the browser was displaying a broken image (encoded in base64).

I have followed [this article](http://www.davidmeents.com/how-to-set-up-webpack-image-loader/) written by David which helps setting up **webpack** and **image-webpack-loader**, the problem I had was that the browser was displaying a broken image so after a little research I've found [webpack/file-loader/issue/35](https://github.com/webpack/file-loader/issues/35) which explains the reason of this.

If you dig a little, you will notice that the broken image is actually just some JS code:

{{< highlight Javascript >}}
module.exports = __webpack_public_path__ + "265a6261bff86f8c7bc3c98c5eba3583.png"
{{< / highlight >}}


## Solution <i class="em em-facepunch"></i>
The issue is that both **babel-loader** and **file-loader** are handling the files so I just have removed **file-loader** from my webpack configuration file and **it works**. Now my loader looks like this:

{{< highlight Javascript >}}
// images loader
config.module.loaders.push({
  test: /\.(jpe?g|png|gif|svg)$/i,
  loaders: [
    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
  ]
})
{{< / highlight >}}

I hope that helps you!
