//@flow

let steps = [
  {
    title: 'Generating similarity graph',
    progress: 0
  },
  {
    title: 'Removing dissimilar connected pixels',
    progress: 0
  },
  {
    title: 'Resolving ambiguous diagonals',
    progress: 0
  },
  {
    title: 'Computing reshaped graph',
    progress: 0
  },
  {
    title: 'Isolating visible edges',
    progress: 0
  }
];
let done = false;

const Progressor = {};

Progressor.reset = () => {
  for (let i = 0; i < steps.length; ++i) {
    steps[i].progress = 0;
  }
  done = false;
};

Progressor.progress = (step: number, percent: number) => {
  if (steps[step]) {
    steps[step].progress = percent;
  }
};

Progressor.done = () => {
  for (let i = 0; i < steps.length; ++i) {
    steps[i].progress = 100;
  }
  done = true;
};

Progressor.getProgression = () => {
  let p = 0;
  let title = null;

  for (let i = 0; i < steps.length; ++i) {
    p += steps[i].progress;

    if (!title && steps[i].progress !== 100) {
      title = steps[i].title;
    }
  }

  const total = Math.floor(p / steps.length);

  return {
    title: total === 100 ? 'Finalizing...' : title || steps[0].title,
    percent: total,
    complete: done
  };
};

export default Progressor;
