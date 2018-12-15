# particleThings
Turn things into particles and play around. [Experience it here](https://johnenoonan.github.io/particleThings/).
## About
ParticleThings is a group project made by Kalvin Janik, [Zeana Llamas](https://zllamas.wixsite.com/portfolio), and [John Noonan](https://johnenoonan.github.io/). Our goal in creating this project is to create a system that encourages experimentation through interaction that is designed around flexibility in terms of options and effects.
ParticleThings is just that, a tool to turn objects into particles that can be played with and altered. Specifically, it renders 3D models as a collection of particles that the user may interact with.
## Interaction
With a mouse and through a graphical user interface (GUI) users are able to control their own experience and effects by changing textures, toggling forces, and deforming the system by pushing and pulling particles. By choosing from a host of parameter options ranging from the aesthetic to the purely functional, and by having direct responsive control, the user is able to use the project to create their own unique art directed experience.

## Implementation
ParticleThings leverages the great work of many existing libraries. The GUI utilizes [dat.gui.js](https://github.com/dataarts/dat.gui) and [stats.js](https://github.com/mrdoob/stats.js) while capturing the mouse velocity is modelled after [mouse-speed.js](https://github.com/processprocess/mouse-speed). Most importantly though, all 3D data structures and graphical elements are implemented using [three.js](https://threejs.org/).
