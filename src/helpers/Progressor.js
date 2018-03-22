//@flow

let steps = [
  {
    title: 'Generating similarity graph',
    progress: 0
  },
  {
    title: 'Resolving ambiguous diagonals',
    progress: 0
  },
  {
    title: 'Computing reshaped graph',
    progress: 0
  }
];

const Progressor = {};

Progressor.reset = () => {
  for (let i = 0; i < steps.length; ++i) {
    steps[i].progress = 0;
  }
};

Progressor.progress = (step: number, percent: number) => {
  if (steps[step]) {
    steps[step].progress = percent;
  }
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

  return {
    title: title || steps[0].title,
    progress: Math.floor(p / steps.length)
  };
};

export default Progressor;
