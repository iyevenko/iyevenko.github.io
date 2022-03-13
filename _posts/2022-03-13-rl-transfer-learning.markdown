---
layout: post
title:  "RL Transfer Learning"
date:   2022-03-13 12:00:00 -0500
categories: jekyll update
---

After training the 3D model of my [robotic arm]({% link 404.html %}) in the MuJoCo simulator, I had to figure out how to adapt the policy learned in the simulation environment to the real world. Most of the research in sim2real transfer seemed like overkill in this case, since my problem is much simpler - I have a policy that maps motor positions in the sim to motor torques in the sim and I want to use this policy to control real motors. I'm going to stay away from using raw pixel inputs for now.

The most obvious way to do this is to freeze the policy and learn two mappings: one from real motor positions to simulated motor positions, and one from simulated motor torques to real motor torques. This way all the knowledge about how to move the joints that was learned in the sim and baked into the policy weights is kept and we still get all the speed, safety and controllabilty advantages of learning in simulation. Also, a key point about this method is that transfer time doesn't scale with the difficulty of the learned task, only with the difference between the the real world and simulation environments. 
