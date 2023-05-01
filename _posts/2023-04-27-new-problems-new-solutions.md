---
layout: post
title:  "New Problems and New Solutions"
date:   2023-04-27 17:00:00 -0500
categories: jekyll update
---
It's been a while since I made a post on here, but I work on and think about different things now so my plan for this being a research blog kinda fell through. This post will be a high-level summary of my last year of thoughts that motivate what I'm working on now, starting with why I'm not working on AI anymore.

### Old problems

For the last 3 years I've learned a lot from playing with small neural nets on my desktop's overworked CPU. I gained a lot of intuition about what exactly makes AGI hard — distribution shift, representational collapse, entanglement, the exploration/exploitation tradeoff, data collection etc. I could keep exploring this stuff for decades and still learn new things every day. 

The field of AI is changing drastically though. It's no longer a place for blue sky exploration and reasoning from first principles. It's now about scaling to the limit and squeezing out every last drop of performance we can get from transformers. The challenge has shifted from designing models to curating datasets, from science to engineering.

Don't get me wrong, the pace of progress is astounding, and we're approaching the goal of AGI faster than ever. When I started learning AI in 2020, the general consensus was that we were still missing the fundamental understanding required to build systems like GPT-4 and Segment Anything. Now we know that the scale maximalists were right all along and my [post]({% post_url 2022-03-13-alternative-nn %}) from just a year ago is looking pretty laughable.

Despite all that, I couldn't help the feeling that all of this is incredibly unsatisfying. There was an overwhelming sense of *That's it?* that killed my excitement about AI. The way I wanted to solve the problem was clearly not the way it's being solved, so I just began to lose interest. Here and there, some really cool [interpretability work](https://transformer-circuits.pub/2022/toy_model/index.html) would come out that reminded me of the kind of poking around in NN's that I really enjoyed doing, but that wasn't enough for me to want to pour my whole life into it. Plus, DeepMind just [solved Minecraft](https://danijar.com/project/dreamerv3/)! What else is left for me to do?

### New problems

After enduring a fully online first year of university, I was excited to see how much better in-person classes would be. I, like the rest of my class, hoped that in-person classes would be more engaging, more insightful and more interactive. What I got was 0.5x speed lectures that were less structured and understandable than the unpolished pre-recorded videos I'd been used to. Lectures would suck the life out of me every day and leave me with no better understanding than I could get from 20 minutes of skimming the lecture notes.

For courses that still posted lecture notes slides online, I stopped going to lectures completely and just crammed those in the last few days before exams. Once I realized how easy it was to get away with this, I leaned into the strategy completely. Last semester, I went to only the first lecture for every class, then crammed half of the entire course content within 24 hours of the midterm and final for every one of my 5 engineering courses. In total, I spent ~2 days per course, plus an additional 3-6 hours per week for mandatory labs. That's about the same amount of time I spent travelling in Japan that same term...

This should not be possible in what is considered the best undergraduate engineering program in Canada. Although this is admittedly not as bad in my school's CS program, I'm still amazed at the price to value ratio being offered at a relatively prestigious institution. My experience has led me to believe that there are fundamental problems with university education that make it near useless despite the associated prestige. If you combine this with the fact that public school education leading up to university is a complete joke, I'd say education is pretty fucked up right now.

Seeing as the thing I love to do most in life is learn, it infuriates me that somehow *school* is not the best place to learn. This has been the problem I've felt most passionate about for as long as I can remember, and I genuinely don't believe there's anyone who cares about fixing this as much as I do. If that's the case then I need to start working on fixing education ASAP, so AI research is going to have to take the back seat.

### New solutions

I've got two approaches to solving education that I'm excited about:

**Calculator School:**
This is an idea that I've been exploring with my [friend and roommate](https://clayhaight.com/index.html)for the past few years (take a look at his blog post "Educational Manifesto"). I'll make a blog post detailing how it works in the future, but the main idea is that learning is most effective when you're stuck on a hard problem.

I've found that you must be both acquiring and applying knowledge simultaneously for it to actually make permanent and meaningful connections in your brain. Given that observation, the solution is to replace lectures as the atomic unit of learning with *simulations*. Making a simulation of a physical phenomenon is the only way to prove your understanding of it, so in order to prove you've learned something you should be able to simulate it. This is where the term "calculator school" comes from. The curriculum is just a set of calculators that predict the real world with reasonable accuracy. The final product would look like a template for a "calculator course" that profs could use to make any course a more hands-on learning experience.

Obviously, we've only thought about this through the lens of how to make a better engineering program, but I'm convinced this method of learning can be applied across the board. 

**Globe:**
I'm working on a startup called Globe, which aims to be a general solution to knowledge management. The problem today is that too much of the information we interact with is lost because our brains just can't handle the quantity of content required for any sufficiently difficult task. Not only does this hinder our own ability to reason, but we're not able to transfer this knowledge to others in an efficient way. The best options available today are a) a conversation with 1-3 friends or b) a powerpoint to many people. Both of those media are incredibly lossy.

I want to be able to query my friends brain for anything they've ever learned and get a breakdown of how they learned it. I want to be able to understand a company's entire tech stack without sifting through hundreds of pages of lazy documentation. I want a scalable way to interact with someone's knowledge.

I don't think that has to be science fiction anymore. We have all the necessary technology to make that happen. It only takes 3 steps:

1. Store all the information you read on your computer
2. Index that information so that it's easily searchable
3. Query for information using language and have it presented in a useful way

Step 1 is super easy, I've already done it with MacOS API's to grab screenshots and run OCR. Step 2 & 3 is where LLM's come in. I'm working on giving GPT-4 access to a semantic search engine that searches over information snippets extracted by GPT-4. My [cofounder](https://www.brianmach.com/)is working on a general way to intelligently combine those information snippets into the optimal visualization of the answer to any query.

I'll be making regular posts to share my progress on Globe, since I'm taking the next 4 months off of school and coop to work on this. Goal is to make something useable by the end of May and give it to people by the end August.