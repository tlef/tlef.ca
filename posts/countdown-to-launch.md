---
title: Countdown to Launch  
date: 2019-03-13  
author: tlef  
tags: slack, api, dev  
---

This morning, the [Slack Developer Blog](https://medium.com/slack-developer-blog/countdown-to-launch-4498346abd90) published my blog post about the Scheduled Messages API.

While developing calendar integrations (like Google Calendar), we needed to build a just-in-time messaging scheduler, which is now, finally, available to the public.

When sending hundreds of thousands of messages at exactly 9:00 AM ("Here's your calendar schedule for the day"), you don't want them showing up at 9:03 due to a message scheduling bottleneck. Using this API allows us (and now you) to pre-schedule your messages to be fired precisely at 9:00 AM. The moment the second hand hits 00, the messages will be deployed.

You can read the blog post here: [Countdown to Launch](https://medium.com/slack-developer-blog/countdown-to-launch-4498346abd90)