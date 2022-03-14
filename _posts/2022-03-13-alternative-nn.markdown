---
layout: post
title:  "What an alternative to Neural Networks might look like"
date:   2022-03-13 17:00:00 -0500
categories: jekyll update
---

### **What is a Neural Network?**
There are many ways to interpret what neural networks do. Some of these interpretations are less useful than others (e.g. analogies to the brain), and some are helpful tools for understanding what neural networks do. Here are a few interpretations that help me understand what a neural network is:

 - locality sensitive hashing function
 - chopping up the input space with linear boundaries
 - continuous (and differentiable) approximation of a function from discrete samples


### **Problems with Neural Networks**
#### *Continual Learning*
Arguably the biggest issue with neural networks as an approach to artifical intelligence is that they are unable to learn from new data once they are "trained". Training a neural network requires curating a training set that you hope captures enough information about the given task to perform well on a test set, which is meant to accurately reflect the data you expect your model to see when it's deployed. There's no way around this split between training samples and testing samples because neural networks are continous function approximators from discrete samples.

If the goal of AI is to create human-level intelligence, then the only suitable test set is the world, and data from the world must be sampled in an online manner. This is equivalent to changing the test set after each epoch of training. Neural networks are notoriously bad at handling tasks with "moving goal posts" (e.g. the domain/distributional shift problem in online RL) due to their tendency to overwrite their weights and start from scratch whenever the data changes. See my experiment on [few-shot generalization of MNist digits]({% link 404.html %}) for more on this. 

I will note that inability to do continual learning isn't inherent to neural networks - only the way we train them, namely gradient descent. The problem is we don't have any really good ways of training neural networks without some form of gradient descent since differentiablility is their main advantage over other representation methods. A good example of another way to train neural networks is [NEAT](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies)





