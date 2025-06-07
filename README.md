# Train Kid

> How would it feel to get around Boston if your transit
> app knew about missed connections, ghost buses, and rush
> hour crowding?
> Try it at [**trainkid.boston**](https://trainkid.boston).

## What is Train Kid?

Train Kid is a working demo of what trip planning could look like if we designed from *uncertainty* first: a smarter model that keeps working when transit hits the exceptions that form the rule. It's an experiment in clarity under uncertainty.

Train Kid is built on a novel model that *plans ahead for when things go wrong*. Based on real data collected over months from the MBTA's comings and goings, it treats missed connections, ghost buses, slow Green Line trolleys, bunching, and rush hour crowding as a reality, not an exception.

## Using Train Kid

The Train Kid app is a Progressive Web App designed to be
used as a mobile app. Visit
[trainkid.boston](https://trainkid.boston) and **add it
to your home screen** - this makes it behave like a native
app. Use "Add to Home Screen" in your browser menu. It's free!

* **Enter origin and destination** (a few words or an address).
* Hit **See Trips**.

### What Train Kid shows you

Train Kid shows you the fastest way to get to your destination. But sometimes, a trip might look fast, but be filled with uncertainty. **The summary at the top tells you what's up before you leave your front door.**

Sometimes there's no single fastest way to get there. If there are multiple options with tradeoffs, Train Kid tries to show you what those tradeoffs are. It simulates your trip 50 times, accounting for things like missed transfers and delays. Then it shows you a graph: each simulation becomes a pink dot, showing the time you might arrive.

## Why I made this

I live in Allston and studied at Northeastern. There are four or five different ways to get to Northeastern, and each one has different advantages from moment to moment. When I read [When(ish) is My Bus?](https://dl.acm.org/doi/10.1145/2858036.2858558) by Kay et al., I wanted their idea in my hands for real. By the end of that month, I had the first prototype of Train Kid, and I was using it every morning to get to work.

Google Maps is great for driving - I can't think of a single time its estimate has been a minute off. But transit is less predictable. So I stopped building in five arbitrary minutes that vanished the moment I wanted to do my makeup, and started leaving when I *really* needed to.

Train Kid started as a tool for me. Now it's an experiment in what transit planning could look like if we stopped lying to ourselves.

## Do you like this?

I think I'm doing something that opens up a lot of possibilities for how free we feel to move. But so far I've been experimenting on my own, making things that help *me* feel free. If my experiment or my ideas excite you, I want to hear about it. My email is on [my website](https://cosine.website), and you can [open an issue](https://github.com/CosineP/train-kid/issues/new) here as well.

I'm trying to find out what's possible with uncertainty, *not* build the next great transit app. If you're a transit agency or work on an app, let’s talk.

## Licensing

Train Kid's frontend is free software ([MPL 2](./LICENSE)) and you may use it personally or commercially. I am really excited to see what people do with my twists on Kay et al's visualizations.

That said, the model and data that makes it work have not been released at this time. If that bums you out, I want to hear from you - I'm considering offering the model as a paid API or licensed backend. [Send me an email](https://cosine.website) if you want access for testing or integration. Also note that I have a [trademark policy](./TRADEMARK.md); please don’t impersonate or claim to be Train Kid.

## Building from source

Train Kid requires three external services to operate:

1. An [OpenTripPlanner](https://www.opentripplanner.org/) instance
2. An MBTA API key
3. A probabilistic transit model

For your OTP instance, I recommend shrinking the OSM PBF file to a smaller region than all of MA and building the graph on a high-memory machine. You can request an MBTA API key [here](https://api-v3.mbta.com/register); approval is usually quick.

My model is not currently licensed for public use. So there are two options:

1. Provide your own implementation of the model interface, which I've designed to be small,
2. Or use my model as a service.

Please send me an email or open an issue and I will personally help you through either of these options! More detailed documentation will be publicly available soon (within the next few weeks) as I stabilize the interface to a 1.0.

Add a .env file like below. Then, it's a standard vite app: `npx vite build` and host `dist/` as a static site.

```.env
VITE_OTP_URL=https://your.otp.instance/otp/gtfs/v1
VITE_MBTA_KEY=your-mbta-key
```

## Acknowledgements

Inspired by the excellent
[**When(ish) is My Bus?**](https://dl.acm.org/doi/10.1145/2858036.2858558)
by Kay, Kola, Hullman, and Munson - thanks to Professor
Michelle Borkin for showing me the paper.

Thanks to Professor Steven Holtzen for
[**tinydice**](https://github.com/SHoltzen/oplss24-code/blob/main/7-tinydice/tinydice.ml),
the original PPL backend. I still use a fork for
differential testing. My version adds support for integer
categorical distributions, performance tweaks, and some
bugfixes.
