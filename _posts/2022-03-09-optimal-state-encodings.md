---
layout: post
title:  "Discovering Optimal State Encodings for Reinforcement Learning Algorithms"
date:   2022-03-09 17:00:00 -0500
categories: jekyll update
---
It is well known that reinforcement learning algorithms perform much better when they are given state vectors that are as low-dimensional as possible, while still sufficiently describing the state of the environment. This is because an agent must know enough about its environment to determine the optimal action to take, but if it is given too much information, the policy search space becomes too big for any current reinforcement learning algorithm to find a global minimum.

This explosion in policy search space becomes evident when you try to train a deep reinforcement learning agent on the raw pixel inputs of an Atari game, for example. Although Atari games are considered more or less solved in the Deep RL world, current state of the art algorithms converge to an optimal policy much slower when given pixel inputs than when they are given the true environment state. The figure below is taken from the CURL paper ([link](https://arxiv.org/abs/2004.04136v1)), and it illustrates the performance gap between the SAC algorithm trained on pixel inputs (green) and the same algorithm trained on the environment state (grey).

![curl results](/assets/curl_results.png)

The way that CURL improves on existing algorithms that learn from pixel inputs, is by randomly cropping images and enforcing a contrastive loss to learn spatially-relevant features which are encoded into a low dimensional state vector. In the paper, they use 50-dimensional state vectors, which is a huge reduction from raw pixel-space.

In this post, I propose an alternative method to contrastive learning for encoding the state space of visual reinforcement learning tasks into useful and low-dimensional state vectors. My approach is motivated by the theory of predictive coding from neuroscience, which states that the brain models the outside world by constantly generating predictions about the environment.

### **Linear State Prediction**
Consider an environment in which the minimum dimension of a fully expressive state space is known. One such environment is a 2-dimensional plane that contains a single point. By definition, the minimum dimension of this environment’s state space is 2 — the x and y coordinates of the point. This means that an agent tasked with learning how to act in this environment (regardless of the reward function) will likely learn quickest if the state space is the x and y coordinates of the point.

But how do we design a model that learns this optimal encoding in an unsupervised manner? One way is to make a very simple assumption about the important low-level features in the environment: at any timestep t, any given feature x can be linear extrapolated from its own value on the two previous timesteps, t-1 and t-2. Or as an equation:

![equation 1](/assets/eq1.png){:style="display:block; margin-left:auto; margin-right:auto"}


In the context of a point in a 2-d plane, we expect a point moving in a straight line to follow this assumption. If x_t and y_t are the x and y coordinates of the point, then the following equations hold:

![equation 2](/assets/eq2.png){:style="display:block; margin-left:auto; margin-right:auto"}

The above equations are also good approximations of points on a curved path, given sufficiently small timesteps. It’s important to note that the point of making these predictions isn’t actually to make accurate predictions — that would likely require a more complex model that is harder to learn — instead, these predictions will only serve as a signal for discovering useful features.

This learning signal comes from a single loss function: the mean squared error between the linearly extrapolated prediction and the actual observation seen on the next timestep. This can be written as follows:

![equation 3](/assets/eq3.png){:style="display:block; margin-left:auto; margin-right:auto; max-width:70%;"}

### **Results: Linear State Prediction**
To test out the performance of linear state prediction, I created a simple environment that models the 2-d plane with a point like the example given before.

![env gif](/assets/env.gif){:style="display:block; margin-left:auto; margin-right:auto; max-width:200%; max-height:200%;"}

I then trained a simple network (1 3x3 conv with 1 filter -> flatten -> dense with 2 outputs) in an attempt to extract the x and y coordinates. The plot below shows the value of both outputs of the model at every point when the white square is placed in that point.

![encoding 1](/assets/encodings1.png){:style="display:block; margin-left:auto; margin-right:auto"}

There seems to be no evidence of a coordinate system being learned here, so this approach doesn’t seem to work. I tried a number of different model configurations including deeper and wider layers, as well as pooling layers, but the results were always the same.

The reason this approach doesn’t work right away is that we are trying to extract spatial information from a translation invariant model. The only way we can expect the model to get this information is to store it in the last dense layer as a lookup table. Using any current gradient descent algorithm, it is nearly impossible to start from a random initialization and end up with a nice 4096-length (64x64) lookup table. In fact, that would defeat the purpose of using neural networks.

### **Soft Argmax**
Since going from a 2-d map to x-y coordinates is difficult with a neural network, it might make sense to introduce a function that explicitly converts between those two domains. The most obvious way to do that is with a 2-d argmax. This would output the x and y coordinate of the greatest activation after applying a filter and ReLU, giving us the location of a feature that the model has learned to detect. Doing a 2-d argmax requires an extra flattening step compared to a regular argmax (see here for a simple numpy implementation).

The only problem with an argmax is that it’s non-differentiable. That means we can’t actually propagate the signal from the loss all the way back to the weights of the conv layer. My workaround for this is to use a soft argmax, which approximates an argmax with a differentiable softmax. The only downside is that it does not work well when there a two or more global maximums in the array. In that case it simply averages their positions, which isn’t super desirable. However, learning the concept of groups of objects could avoid this issue (it seems likely that the human brain does this).

### **Results: Soft Argmax + Linear State Prediction**
Using the same environment as before, and the same model architecture (plus one soft argmax layer between the conv and dense), this was the resulting activation map:

![encoding 2](/assets/encodings2.png){:style="display:block; margin-left:auto; margin-right:auto"}

The above map shows that the soft argmax function following a convolutional layer allows the model to translate pixel space into x and y coordinates for optimally representing the state space of our toy problem.

### **What's Next?**
The results from using linear state prediction and soft argmax are cool, but their performance on a toy problem doesn’t yet prove that they are effective for more challenging tasks like Atari games. The next task is to investigate what kinds of features can be learned in more complex environments, and whether or not it is possible to scale past just a single convolutional layer that detects a square moving in straight lines.

I’m currently working on applying the concepts introduced here to the Atari Gym environment and running standard RL algorithms to test their performance. I’ll follow up on those results in a future post.