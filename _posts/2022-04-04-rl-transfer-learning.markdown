---
layout: post
title:  "RL Transfer Learning"
date:   2022-04-04 18:00:00 -0500
categories: jekyll update
---
Click [here](https://drive.google.com/drive/folders/19JuxNfYaxAnZI6tRyt-nZ-9eFvOWEGoB?usp=sharing) if you just want to watch some cool videos.

After training the 3D model of my [robotic arm](https://github.com/iyevenko/RL-Arm) in the MuJoCo simulator, I had to figure out how to adapt the policy learned in the simulation environment to the real world. Most of the research in sim2real transfer seemed like overkill in this case, since my problem is much simpler -- I have a policy that maps motor positions in the sim to motor torques in the sim and I want to use this policy to control real motors. I'm going to stay away from using raw pixel inputs for now and instead use the joint positions and velocities.

The most obvious way (for me) to do this is to freeze the policy and learn two mappings: one from real motor positions to simulated motor positions, and one from simulated motor torques to real motor torques. This way all the knowledge about how to move the joints that was learned in the sim and baked into the policy weights is kept and we still get all the speed, safety and controllabilty advantages of learning in simulation. Also, a key point about this method is that transfer time doesn't scale with the difficulty of the learned task, only with the difference between the the real world and simulation environments. 

### **Experimental Setup**

#### *Environment*
I tested my method of transfer learning on the [Walker2d](https://gym.openai.com/envs/Walker2d-v2/) environment (part of the OpenAI Gym MuJoCo suite) which I modified to be able to systematically change the environment parameters. This is the custom suite of environments I created:

 - **`walker2d_base`**: The original Walker2d-v2 environment
 - **`walker2d_low_friction`**: Friction coefficient of feet set with an adjustable parameter (default ~60% of base friction)
 - **`walker2d_short_joints`**: Shortened joints and roughly the same body proportions
 - **`walker2d_long_joints`**: Lengthened joints and roughly the same body proportions


Walker2d was the simplest (and therefore quickest to train) environment that I found also produced diverse policies when changing up some of the parameters.

#### *Model*
I used the [Spinning Up PPO-clip implementation](https://spinningup.openai.com/en/latest/algorithms/ppo.html) to train the policy (actor) and value function (critic) for the Walker2d environment.

The model I used for learning the actor was a simple MLP with two 64-dim hidden layers that output the mean and standard deviation from which actions were sampled and the actor loss was calculated. The critic had the same architecture but output a single scalar value instead of an action distribution vector. These models were trained with PPO for 10,000 epochs. This is the policy that it learned (note that the purple leg is rigid, we'll see this popping up again in later experiments):

{% include youtubePlayer.html id="Pc-vHrympog" width="500" height="500" %}

To adapt the learned policy to the other modified environments, I prepended a two layer MLP with 32 hidden units and Tanh non-linearities to both the actor and critic networks (one each, since sharing weights caused divergence), and postpended an identical MLP to the actor network. The weights from the original training on the `walker2d_base` environment were frozen, so only the weights of the added MLP's were learned in the new environment. An important note is that I didn't just add these MLP's sequentially before and after the original networks, because that would make the network start from random weights, but I didn't want that. I wanted the network to start with the original policy that was learned on the base environment, then learn to tweak the inputs and outputs in a way that maps the new environment states and actions to the new environment states and actions. I did this by adding a skip connection (à la ResNet) and initializing the new MLP weights to very small values so that the new policy would be almost exactly the same as the original with a little random perturbation. The diagram below shows the new policy and value function networks with the added layers:

![transfer architecture](/assets/rl_transfer/transfer_architecture.jpg){:style="display:block; margin-left:auto; margin-right:auto"}

### **Results**
The first experiment I tried was to compare the performance of three models on each of modified Walker2d environments:

 - **`zeroshot`**: The actor network trained on the original `walker2d_base` environment for 10,000 epochs
 - **`transfer`**: The `walker2d_base` actor network with the added layers described in the Model section, trained for 1,000 epochs on the modified environment
 - **`scratch`**: A new model trained from scratch on the modified environment, the same way the original `walker2d_base` model was trained (also 10,000 epochs)

The results are summarized in this chart (all returns averaged over 100 episodes):

![transfer test](/assets/rl_transfer/transfer_test.png){:style="display:block; margin-left:auto; margin-right:auto"}

You can watch videos of all the trained policies [here](https://drive.google.com/drive/folders/19JuxNfYaxAnZI6tRyt-nZ-9eFvOWEGoB?usp=sharing)

The transfer learning scheme seemed to work perfectly for the `walker2d_short_joints` environment. After transfer learning for 1,000 epochs, the new policy performed over 5x better, almost exactly matching the performance of the model trained from scratch for 10x longer. Watching the [policy video](https://drive.google.com/file/d/1x4OIzwTJ527ldcg6M3vfs4TJZL2w9rqZ/view?usp=sharing) shows that the `transfer` model uses the same rigid leg strategy that was learned by the `walker2d_base` model, which means the transfer learning scheme does exactly what I invisioned it would do in the introducton to this post. The policy learned from [scratch](https://drive.google.com/file/d/1baoGnD-1YA3Y-GfXEIGuRo6nt84nFWc7/view?usp=sharing), however, is more complex and doesn't have the same repetitive structure to it.

The `walker2d_long_joints` environment, on the other hand, gained almost nothing from transfer learning for 1,000 epochs. It's at least a good sign that the returns were slightly higher when transfer-learned rather than zero-shot, because that means my method is almost guaranteed to do at least as well as the base policy. I think the lack of improvement over the base policy in this environment indicates that the rigid leg strategy learned by the `walker2d_base` model just doesn't work in this environment, in which case my transfer learning scheme isn't designed to work. From the [policy video](https://drive.google.com/file/d/1hJvf0rB8t907ifi8Sk0KUJR7_zV9rZeN/view?usp=sharing) for this experiement it's clear that the geometry of the longer-jointed walker is too different from the original environment, so the feet don't have enough leverage to keep the walker upright. The video of the `scratch` [model](https://drive.google.com/file/d/1fXQVHm0zkB2WEIXdebOAiqzmDy_H5Az5/view?usp=sharing) on this environment showcases a completely different strategy for moving in this environment.

The `walker2d_low_friction` results are somewhat inconclusive. It seems that transfer learning definitely works, since just like the `walker2d_short_joints` environment the `transfer` model outperforms the zero-shot model by \~5x. The `transfer` model still falls short of the performance of the `scratch` model though, despite the latter achieving by far the lowest returns on this environment (see rightmost 3 bars). To further evaluate my transfer learning scheme on the `walker2d_low_friction` environment, I decided to make 4 new low friction environments, with friction varied in increments of 20% of the `walker2d_base` friction values. I compared the performance of 1,000 epoch `transfer` models vs the `zeroshot` models on these environments and plotted the performance dropoff w.r.t. percentage of `walker2d_base` friction.

![transfer test](/assets/rl_transfer/friction_test.png){:style="display:block; margin-left:auto; margin-right:auto"}

I had to plot this curve on a log scale because the results I got on the 80% friction environment were way higher than the rest. I also had to cap the simulation at 10,000 steps because otherwise simulating one episode was taking upwards of a minute and averaging over 100 episodes would take hours. Even if I ran this overnight, the return would be so high that the return of other environments would've been squashed on the graph, even with log scaling. Point is, for some reason training for 10,000 epochs on `walker2d_base` (100% friction), then performing transfer learning using my method for 1,000 epochs on `walker2d_friction_80` (80% friction) achieved amazing results. In fact the results are much better (and more consistent) than the `walker2d_base` model on its native environment. From the training graph, you can see that it only took about 50 epochs to achieve this high performance (the return plateau is due to the max sim step limit in training).

![transfer test](/assets/rl_transfer/friction_80.png){:style="display:block; margin-left:auto; margin-right:auto"}

This result is really interesting, but it deserves an entire investigation on it's own so I'll have to do that some time in the future. The key questions to answer will be:

 - Is this result specific to transferring from the 100% to 80% friction Walker2d environments?
 - Does this result depend on the difficulty of the environment?
 - Does this hint at a possible new architecture for cirriculum learning tasks that avoids catastrophic forgetting?
 - Does my method of transfer learning by freezing and adding skip-connections enable modular network architectures that don't need to be learned end-to-end?

If the answer to the last question is yes, then maybe I was wrong about the inability for neural networks to do continual learning that I explained in [this post]({% post_url 2022-03-13-alternative-nn %}), where I pointed out the flaws of gradient-based learning. Either way, I'm excited to see where this leads.

### **Discussion**
At the beginning of this post, I proposed a method for adapting a policy learned in simulation to a real-world robot that has different motors and different sensors than the simulated robot. I found that this method worked well for environments where the underlying sequence of actions needed (in this case, the robot's gait) is very similar to that of the original environment, even if the robot's intrinsic properties like joint length and surface friction were altered significantly. Although I don't have a physical robot to confirm these conclusions, using my method across different simulation environments showed promising results that I expect to hold in the real world.

One other application that I expect my method to work well in is cirriculum learning in simulation. I showed that my method preserves the underlying simple policy learned in the base environment after transferring to a different environment. This means that a policy learned in a simpler environment -- which is likely more robust and easier to train -- can be adapted to incrementally more difficult environments, without learning an overly complex policy that overfits to the difficult environment.

Finally, I ran into the surprising result that my transfer learning scheme almost solved the Walker2d task when transferring from the 100% to 80% friction environment, which led me to wonder whether this transfer learning scheme is a more general algorithm for modular training of neural networks that avoids catastrophic forgetting. 