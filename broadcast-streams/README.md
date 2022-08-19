# Broadcast Streams

Simple "reactive variable" variable using a "broadcast stream".


## Goals

* Produce a variable where a consumer may listen to and expect to receieve messages (events) when the variables value changes. A "reactive" variable.
* As a thought experiment I imagined a group of friends using walkie talkies to pass messages to the group, each friend has the ability to listen as well as broadcast to all listeners. This simple broadcast mechanism I will refer to as a "broadcast stream".
* Once we have the "broadcast stream" a "reactive variable" is a simple extension. Whenever a new message is broadcast to the stream the variable actor stores the message and makes it available on demand. That's it, we now have a primitive where we can write new values, listen for update events, and we can ask it for the last known value on demand. 

## Notes

* ECMAScript will drain it's microtask queue before attempting the next task, and on the web in particular too many (or worse cascading) micro tasks can lead to blocking the UI.
* The implementation of the BroadcastStream was therefore too simplistic, while relying on promises satisfied my goal of "dead simple" it also was a footgun. A configurable queue would have been required.
* Another reason I chose to use Promise was because they felt like the more idomatic approach to callbacks in ECMAScript. I should have instead provided helper methods to wrap and produce a promise. (There was no way to opt-out.)
* Conceptually I thought this was a cool approach. I will need to further investigate scheduling & priority queuing.
