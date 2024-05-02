---
categories:
  - blog
date: 2024-05-02T22:00:00Z
tags:
  - aws
  - lambda
  - serverless
title: "AWS Lambda: TypeError: Wrong arguments"
description: "ERROR	Invoke Error"
---

I've faced the following error for a few hours, until I realized how simple the solution was.

```bash
2024-05-02T20:03:06.574Z	b8a190ca-89fd-4dc5-a277-a0fa06b35091	ERROR	Invoke Error 	
{
    "errorType": "TypeError",
    "errorMessage": "Wrong arguments",
    "stack": [
        "TypeError: Wrong arguments",
        "    at RAPIDClient.postInvocationResponse (file:///var/runtime/index.mjs:434:27)",
        "    at complete (file:///var/runtime/index.mjs:811:16)",
        "    at done (file:///var/runtime/index.mjs:835:11)",
        "    at succeed (file:///var/runtime/index.mjs:839:9)",
        "    at file:///var/runtime/index.mjs:872:20",
        "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"
    ]
}
```

After checking line by line, I noticed that I was accessing an environment variable that was **not definied**.

Apparently, accessing `process.env` for an undefined key causes this issue.

I am also using `serverless-esbuild` which may also cause the error to be harder to identify (I am not sure)!

I hope that by sharing this, I will help someone :)