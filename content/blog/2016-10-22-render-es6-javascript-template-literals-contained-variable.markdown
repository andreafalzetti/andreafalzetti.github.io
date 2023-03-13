---
author: Andrea Falzetti
categories:
  - blog
date: "2016-10-22T00:32:00Z"
description: using node.js and recursion
tags: 
  - nodejs 
  - javascript 
  - snippets
title: Render ES6 javascript template literals contained in a variable
aliases:
    - /blog/2016/10/22/render-es6-javascript-template-literals-contained-variable.html
    - /blog/2016/10/22/Render-ES6-javascript-template-literals-contained-in-a-variable/
---

## Challenge <i class="em em-checkered_flag"></i>
In the current project I'm working on, at [Activate](http://activate.co.uk), I am using `node.js` and I have variables coming from a yaml file that contain ES6-like template literals, for example:

```
messages:
- "Hey, ${user.name}, how are you feeling today?"
- "What's the weather like in ${user.profile.city}?"
```

and I need to render the variables before sending the message to the client. As you might know, template literals, in order to be rendered need to be wrapped by backtick quotes, for example:

```
let user = { name: "Andrea" };
const greeting = `Hey, ${user.name}, how are you feeling today?`;
console.log(greeting); // Hey, Andrea, how are you feeling today?
```

Unfortunately, if the text that contains your template literals come from an external source (for example from an API call that returns a JSON, or from a file like in my case): **automatic render will NOT happen** and you will end up with `${user.name}` as actual text of your string.

### Solution: Open source <i class="em em-balloon"></i>

When I found out that my plan of using ES6 template literals poorely failed <i class="em em-cry"></i>, as every *good developer* <i class="em em-angel"></i> would do, I googled for an existing solution to my problem, and ... I have found [es6-template-render](https://github.com/guillaumevincent/es6-template-render/blob/master/index.js) which is basically a simple _find & replace_ with the only problem that it was a **really simple** find and replace so it won't support objects like `${user.profile.city}` but only strings such as `Hello ${name}` - which clearly was not enough for me <i class="em em-broken_heart"></i>.

Last week I have been to [OSCON 2016](http://conferences.oreilly.com/oscon), an open soure convention organised by the publisher [O'Reilly](http://www.oreilly.com/) so what is the best thing I could eventually do here to solve my problem?

Of course **contributing to the open source community** with a pull request <i class="em em-dancer"></i>!

I have implemented a nice recursive function that finds all the variables and if it finds an object it will iterate through its keys and follow each other object again and again until rendering everything at any level.

Here's the code, now merged into the [main repository](https://github.com/guillaumevincent/es6-template-render), so please have a look at it, if you have any suggestion on how to improve it, or make it more readable, it would be great to hear from you <i class="em em-grinning"></i>.

{{< highlight Javascript >}}
function _recursive_rendering(string, context, stack) {
  for (var key in context) {
    if (context.hasOwnProperty(key)) {
      if(typeof context[key] === "object") {
        string = _recursive_rendering(string, context[key], (stack?stack+'.':'')+ key);
      } else {
        var find = '\\$\\{\\s*' + (stack?stack +'.':'') + key + '\\s*\\}';
        var re = new RegExp(find, 'g');
        string = string.replace(re, context[key]);
      }
    }
  }
  return string;
}
{{< / highlight >}}

Special thanks go to [@guillaumevincent](https://github.com/guillaumevincent) and [@gabrielperales](https://github.com/gabrielperales) that have respectively created and made ES5-compatible the original code.
