---
layout: post
comments: true
title: 'The Picasso code'
subtitle: '10 things you should NOT do when writing JavaScript code'
date: 2017-07-16 09:00:00
categories: blog
tags: react javascript
author:     "Andrea Falzetti"
header-img: "img/post-bg-01.jpg"
---

Recently, I have been reviewing the following JavaScript code and I found so many issues that I have decided to discuss them here. First of all, I am not trying to embarrass anyone, so I am not mentioning where this comes from. With this post, I want to use bad examples to promote and remind all of us, including myself, to use common sense and best practices when it comes to write new code.

We will look into JavaScript code but the concepts apply to any language.

I named it, **Picasso code**:

![picasso-code-1](/img/2017/07/picasso-code-1.jpg)

------

![picasso-code-2](/img/2017/07/picasso-code-2.jpg)

With a quick read of the code above, you will immediately see that:

### 1. The class is called `Example`
Giving classes, methods and variables **meaningful identifiers** help further improvements or debug of the code later on.

### 2. Arbitrary JavaScript syntax
Be **consistent** in your code and avoid mixing older JavaScript syntax with ES6/ES7 all the time. A mix of callbacks, Async/Await and ES6 .then() promises can be confusing. Sometimes using an arrow function and sometimes not. Using **var**, **let** and **const** thoughtlessly. Reading someone else code written like this, is **frustrating**. Don't do this to other developers.

### 3. Mix of import / require
Mixing **require** and **import** is considered a bad practice, which might also cause bugs, as pointed out by [@dan_abramov](https://twitter.com/dan_abramov/status/883375646357041152), import and require should not be mixed.

<blockquote class="twitter-tweet tw-align-center" data-cards="hidden" data-lang="en"><p lang="en" dir="ltr">Tip: don’t mix imports and requires. The order is not what you’d intuitively think. <a href="https://t.co/phByWlwEvu">pic.twitter.com/phByWlwEvu</a></p>&mdash; Dan Abramov (@dan_abramov) <a href="https://twitter.com/dan_abramov/status/883375646357041152?ref_src=twsrc%5Etfw">July 7, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

### 4. The component is 1600+ lines long
Way too much for what it does, the component is **unreadable** and **untestable**. All methods are coupled together. Try to keep the components short and simple. If you can, write the code using a decoupling pattern.

### 5. Lack of readability
I belong to the group of developers who think that comments in code are not needed. If your code clear and organised, there is no need to explain what you're doing. I use [JSDoc](http://usejsdoc.org/) comments to describe function signatures but besides that I don't comment my code. I think that being able to write easy-to-understand code is a strong skill which makes a dev a good dev.

### 7. No tests at all
There are no tests in place to see if the code is stable and working as expected. Having any sort of automated tests will help you building a better application and providing a better experience to the final users. Tests help you shipping better code to production.

### 5. The core React files has been manually changed
In order to solve an issue he had, the developer thought that it was a good idea to change one of the React core files. **Avoid this at all costs**, if you have any issue with a third-party tool, raise it on their GitHub repository and try to work with them. In this instance, I have noticed that a more recent version of React Native has included the change that the developer needed so it would had been enough upgrading.

### 6. Inconsistent use of semicolons
In JavaScript they are not mandatory but decide, use them or not. Please do not mix.

### 8. Missing PropTypes
The component uses nearly 30 props and none has been defined or validated at all.

### 9. The component connects to Redux directly
It's a best practice to use a Container component to connect to the Redux state, in this case the component and the container are the same thing.

### 10. No linting
Start using [ESLint](https://eslint.org/). It helps writing better quality code with less errors. It sets up very quickly on your machine and you can plug it in, in your project very smoothly using an existing set of rules. One of the most popular is the [Airbnb JavaScript Style Guide() {](https://github.com/airbnb/javascript).


### Wrap up

Outsiders such as Project Managers, CEOs, Investors, might not notice this or consider it an issue, but **it really is**. Your product is not well stractured or organized. It's is messy and unstable. It will be difficult to involve experienced developers to improve it or change it without starting from scratch, which means you have wasted a lot of time and money.

Storybook has been exter
* Using Storybook as a development tool
* accessibility

* bad code

### Useful links

1. Visual tests with Storybook
