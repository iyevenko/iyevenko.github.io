---
layout: post
title:  "All my other projects"
date:   2022-04-15 17:00:00 -0500
categories: jekyll update
---

I've been interested in AI for two years now and I've spent a lot of my free time learning by watching lectures and reading papers, but the main way I learn is by testing my ideas with projects. Most of these projects don't end up as a nice interactive webapp like one of OpenAI's [interactive blogs](https://openai.com/dall-e-2/) and a lot of them aren't finished at all, because what I learn is a lot more important to me than having a finished product. That's the the benefit of doing these projects on my own time rather than in school or in an academic/industry research setting -- there's no objective other than to explore, so as long as I'm learning I'm making progress. This seems like a much better way to learn than copy-pasting TensorFlow tutorials on my github so I can put them on my resume.

My approach to projects has been to start with a question I'd like to answer, for example: "Does a neural net learn reusable representations that can help with generalization?". Then, I find the simplest environment to help me answer this question (in this case I chose MNist) and from there I code up an experiment, for example training a network on the first 9 digits of MNist, then retraining it on examples of a 10th digit. I then quickly run into a hard problem with no current solution (catastrophic forgetting) and I spend weeks thinking about the problem and some ways to solve it, without digging into the literature too much so I don't narrow my thinking.

This might seem like a super naive approach, and it is! That's the point -- you can only find out what makes a problem hard by trying to solve it in the most obvious way, and failure is a lot more informative than success. With that being said here's a list of all the projects I've done in the past two years and a summary of what I learned from each.

---

### Dashcam Video Prediction [(repo)](https://github.com/iyevenko/Dashcam-Predictor)

This was my first ever ML project and also my most ambitious, which is a recipe for failure, but I learned a lot.

**Research question:** Can you use deep learning to predict the next frame of driving footage?

 