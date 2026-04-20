---
title: Zork in Slack
date: 2019-02-01
author: tlef
tags: zork, slack
summary: This post details how to set up and play Zork (via Restful Frotz) within Slack, including step-by-step instructions for integrating with Slack channels using webhooks. It covers the background of the project, setup process, and usage guidelines.
---

Howdy! Five years ago I built a system called Restful Frotz (yeah, I know, a terrible name) which gave users the ability to play Infocom games within Slack (with a plugin system allowing interfaces to other systems). This integration was initially built as an April Fools joke in 2014 appearing on the tail of the original public launch of Slack, and here we are five years later, and there are still many teams playing games like “Zork” daily, with new teams installing the service weekly.

Below are the original setup instructions to get your workspace up and running with Zork 1, 2 or 3 using my hosted server (updated as of Feb 2019). Please enjoy and spread any joy you have. Feel free to hit me up on twitter at @tlef if you have any questions or comments.

--

# Setup Instructions

## Create or choose a channel

Within Slack, choose a channel to play Zork. I would recommend a new channel, maybe something like `#zork`.

## Create an incoming webhook

- Set the channel to the one you chose above (#zork)
- Give your bot a name (something like ‘zork’)
- Upload an icon for your bot (um)
- Copy the incoming webhook token for use in the next step
- Copy the incoming webhook URL for use in the next step

## Build your outgoing-webhook URL

Determine the following parameters:

`session_id` - A unique string. I recommend the incoming webhook token you copied earlier
`data_id` - The game you want to play (values can be zork1, zork2 or zork3)
`output-webhook` - This must be the incoming webhook URL you copied earlier

With this data, build your URL: `https://frotz.tlef.ca/?play&session_id=<your session_id value>&data_id=<your data_id value>&handler=slack&output-webhook=<your output-webhook value>`

## Create an outgoing webhook

- Create a new Outgoing Webhook integration from within Slack
- Select the same channel as in the previous steps (#zork)
- Choose a bot-name and upload an icon (optional, as you’ll only see this if an error occurs)
- Choose a trigger word. I recommend just using z. (You want something short, as you’ll need to type it before every command).
- Copy the URL you created above as the webhooks URL

## How to play

Using your trigger word (z) in the channel (#zork) you setup will send the command to Zork. Leaving off the trigger word will not do anything, so normal discussions can still happen.

For example, to look, type:

```
> z look

You are standing on the top of the Flood Control Dam #3,
which was quite a tourist attraction in times far distant.
There are paths to the north, south, and west, and a scramble down.

> Damn! Look at that

> z south
```

## Legalish & Serviceness

I don’t own the rights to Zork, and this integration is not affiliated with or endorsed by Slack.

This integration comes with no guarantee of uptime, compatibility or support, and may be taken down at any time. Any abuse of the system and it will simply be removed.

Any questions, comments or improvements, feel free to message me at @tlef.ca
