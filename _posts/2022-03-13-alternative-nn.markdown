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
### Continual Learning
Arguably the biggest issue with neural networks as an approach to artifical intelligence is that they are unable to learn from new data once they are "trained". Training a neural network requires curating a training set that you hope captures enough information about the given task to perform well on a test set, which is meant to accurately reflect the data you expect your model to see when it's deployed. There's no way around this split between training samples and testing samples because neural networks are continous function approximators from discrete samples.

If the goal of AI is to create human-level intelligence, then the only suitable test set is the world, and data from the world must be sampled in an online manner. This is equivalent to changing the test set after each epoch of training. Neural networks are notoriously bad at handling tasks with "moving goal posts" (e.g. the domain/distributional shift problem in online RL) due to their tendency to overwrite their weights and start from scratch whenever the data changes. See my experiment on [few-shot generalization of MNist digits]({% link 404.html %}) for more on this. 

I will note that inability to do continual learning isn't inherent to neural networks - only the way we train them, namely gradient descent. The problem is we don't have any really good ways of training neural networks without some form of gradient descent since differentiablility is their main advantage over other representation methods. A good example of another way to train neural networks is [NEAT](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies).

---

### The i.i.d. Assumption
Neural networks work best under the assumption that the data they're trained on is independent and identically distributed, but that is not the way humans learn from data. We perceive data as a constant stream of information that is in chronological order, which means every single "frame" carries much more information than the raw light waves hitting our photoreceptors. The brain's learning algorithm takes advantage of chronologically ordered data to build causal models of the world that capture not only temporal relations (e.g. what happens if you knock over a glass of water) but also spatial relations. For example, the concept of objects is orders of magnitude more easily learned given chronologically ordered data because there's a simple assumption you can make: groups of pixels that move together can be grouped together. It's not obvious how to define what an object is to a system that has only seen randomly sampled images that are completely independent.

This is why datasets like CIFAR-10 and ImageNet are so hard to learn from, with current SOTA models requiring hundreds of repetitions of the same images to achieve high accuracy. When collecting data from the world into one of those datasets, we are stripping away all ordering and continuity between the images on purpose so that our models will generalize better. This seems counterintuitive though, because chronologically ordered data actually leads to learning more robust representations as a result of making good assumptions and simplifications.

---

### Dense Representations
This leads me to the next pitfall of neural networks which is the lack of robust representations. People talk a lot about the lack of explainability in AI and its implications for deployment into production systems and even existential threats of black box AI, but I think they're missing the point of the problem with using black box optimizers. The real issue here is that neural networks learn bad representations that are not *abstract*, *disentangled* or *compositional* and the reason why we can't explain them is because they have no intuitive structure. In other words, they do not take advantage of the world's simple governing principles to compress observations the same way that our brain does.

So what exactly makes me think that neural networks learn bad representations? I mentioned that their representations are not abstract, disentangled or composable so I'll explain exactly what I mean by those words.

#### *Abstraction*
There are many ways to define what an abstract representation is, but the way I think of it centers around hierarchical compression and invariances (I use this term pretty loosely, not the mathematical definition of it). Hierarchical compression is the process of finding all elements in an input which are the "same" by some definition of the word - in other words semantically equivalent - and representing them with the same output, then repeating the process on these outputs. The equivalences are determined by the types of invariance we use, for example, CNN's introduce positional invariance by grouping all patches in the input that match a filter into one output map. Invariances are crucical for data compression.

The *level of abstraction* can be defined as the number of times this process was repeated, starting from low-level inputs (zero iterations) to high level representations (many iterations). Level of abstraction also depends how strong our conditions on semantic equivalence are - if they are fairly loose, then we compress many inputs into the same output and this results in a higher level of abstraction and vice versa. I'd like to come up with a more formal information theoretic way of defining abstraction, but I think this gets the point across.

#### *Disentanglement*
There's a line of research that attempts to "disentangle" the representations learned by neural networks, but as far as I know there's no formal definition for this concept and each paper gives their own intuition on the problem of disentanglement. [Bengio et. al 2013](https://arxiv.org/pdf/1206.5538.pdf) describe disentangled representations as those that encode "factors of variation" independently such that only a few of them tend to change with the input data at a time. For example, you might describe MNist digits with only a few factors like the number, the line width, the angle, etc. However, an entangled representation would fail to capture these factors independently of one another and would for example, encode line width and angle with only one parameter that adjusts both simultaneously. This is what we see when training autoencoders on MNist using CNN's.

I think there's two ways to facilitate learning disentangled features, both of which are used by the brain:

The first is good priors, meaning that we are giving the representation model a sufficient but not exhuastive vocabulary of features from which to learn higher order representations. If we give the prior of lines and curves to a model that represents MNist digits, it's going to do a much better job of recovering features that are disentangled because it knows a little a bit about the structure of the data and can more efficiently compress it into only the useful (and therefore indpendent/distentangled) features.

The second is causation. A good example to illustrate this is light sources (also from Bengio et. al). Because we learn causal models of the world, we know that turning on a light source or moving an existing one will cause shadows to appear, so we don't confuse these shadows with the objects they are associated with. We effectively disentangle the object from the light source into two factors explaining our visual perception of the scene. Also, we effectively entangle things that do not have separate causes, for example, we will never separately perceive the faces of a cube because we don't expect them to ever detach and behave independently.

#### *Compositionality*
Compositionality is the idea that multiple concepts can be combined into a more complex (or abstract) concept using some defined set of rules. These rules define a sort of algebra over the space of concepts that allows zero-shot learning of new concepts by combining known concepts. For example, we can easily imagine a triangular bed might look like, even though we've never seen one, because we are able to take the superposition of the concepts of "triangular" and "bed" which we know very well.

I believe that to achieve compositional representations, we need to take inspiration from the brain and use sparse coding to represent concepts, because sparse binary vectors can be combined in a very natural way - simply taking the AND or OR. More on sparse representations in [this post]({% link 404.html %}).

It seems obvious to me that compact representations of the world must have the three properties of abstraction, disentanglement and compositionality (and possibly others) and the only way to ensure that is to design representation learning algorithms that incorporate these as priors. Currently neural networks have none of these properties (at most, a very weak and inefficient form of abstraction), so I believe that we should be designing alternatives that explicitly incorporate these priors.

---

### Generative Modeling
Yann LeCun makes the point that AI requires learning generative models of the world rather than discriminative ones and I strongly agree with that point, since generative modeling is a lot closer to how our brain learns, but I think that neural networks have a serious flaw that prevents them from building good generative models.

Neural networks don't have prediction built in. What I mean by this is that every single predictive neural network architecture ever designed has two parts: an encoder and a decoder. Autoencoders, transformers, RNN's, ... they all transform input data into some encoding (a.k.a latent variable/state/embedding) that is then used to predict either the input data, or the encoding. 

There's this dichotomy in prediction between predicting inputs and predicting encodings that seems impossible to avoid with neural networks. The consensus in the field is that for visual tasks, predicting inputs doesn't work because that's an impossible task so the only alternative is to predict the encodings. However, when predicting encodings you run into the problem of collapse, where your network learns a trivial encoding like all zeros or constant for every input because the learning objective doesn't have enough constraints. The solution is usually to introduce some fancy loss functions that are tailored to the task. The [first paper I ever implemented](https://ieeexplore.ieee.org/document/9044843) does this, so do architectures like [Dreamer](https://arxiv.org/pdf/1912.01603.pdf) and every GAN that works in practice.

I don't believe that there exists a single loss function that sufficiently captures the essence of learning from prediction that will allow neural networks to learn the robust causal models of the world that the human brain does, so I don't see the point in trying to engineering new loss functions that slowly improve on prediction accuracy with each iteration.

Instead, the correct solution to the problem of prediction is to predict what you can, and ignore the rest - this is obviously what the brain does. Deep learning researchers like to say that their models are learning hierarchical representations, but in reality neural networks are not learning hierarchical representations because there's no constraint to do so. This constraint should come in the form of hierarchical prediction, meaning that we should use the intermediate outputs of our networks to make predictions rather than the last layer. The problem is that the only way to do this is to perform a kind of backwards inference through the network and it's highly impractical to do this in a neural network, especially when you have pooling operations and ReLU activations.

There's only two models that I've found that are designed with prediction built in: [HTM](https://numenta.com/resources/biological-and-machine-intelligence/), which takes inspiration from the brain by modeling neurons in predictive (depolarized) states, and [RCN](https://www.science.org/doi/10.1126/science.aag2612), which uses probabilistic inference to make predictions at any point in the network. 

---

### Architecture Optimization
Neural networks are black box optimizers, which inherently makes them difficult to design and difficult to understand. As a result, there's this unsettling pattern in deep learning research that I, as an outside observer have noticed. It goes like this:

1. Thousands of researchers try to improve on standard benchmarks by taking existing models and adding tricks that are based on some intuition of the problem and of the flaws of previous models.
2. Many of these researchers make tiny improvements, a few with better intuitions make slightly larger improvements, and those with the most racks of GPUs make bigger improvments by scaling up.
3. The ones with the biggest improvements justify their improvements with some jargon (e.g. attention, skip-connections, pooling) which sometimes even makes analogies to the brain.
4. Nobody understands why exactly these tricks work so well but they learn how and when to use them with experience.
5. Back to step 1.

I think step 4 is a really big problem that slows down the path towards AI because it goes against the scientific method. Science tells us to never take correlation as a sufficient explanation for a phenomenon and instead try to build a causal model that gives a more fundamental understanding of it. Our lack of understanding is a consequence of step 3 because every time the authors of a paper try to explain why their method works without much more than a bunch of correlational evidence and a hunch, there is a compounding "explanation error" that makes it harder and harder to understand why today's models work as well as they do and more importantly, why they don't work as well as we think they should. I remember reading my first few deep learning papers and being so excited at the prospect of designing a pipeline with some intuitive names for the components and having it work just by supplying it with some data. It didn't take me long to realize that I was very wrong. I was mislead by the lure of wishful mnemonics (Melanie Mitchell's [3rd Fallacy of AI](https://arxiv.org/pdf/2104.12871.pdf)).

Although it's nice how little domain knowledge and assumptions you have to design into a neural network, we can't design generally intelligent systems if we don't understand why they work because then we're not doing much better than a random search with a selection mechanism that selects for classification accuracy. As Francois Chollet once said on [MLST](https://www.youtube.com/channel/UCMLtBahI5DMrt0NPvDSoIRQ):

> In order to build a general intelligence you need to be optimizing for generality itself.





