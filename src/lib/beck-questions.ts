export type BeckQuestion = {
  id: number;
  category: string;
  options: {
    score: number;
    text: string;
  }[];
};

export const beckQuestions: BeckQuestion[] = [
  {
    id: 1,
    category: "Sadness",
    options: [
      { score: 0, text: "I do not feel sad." },
      { score: 1, text: "I feel sad much of the time." },
      { score: 2, text: "I am sad all the time." },
      { score: 3, text: "I am so sad or unhappy that I can't stand it." }
    ]
  },
  {
    id: 2,
    category: "Pessimism",
    options: [
      { score: 0, text: "I am not particularly pessimistic or discouraged about the future." },
      { score: 1, text: "I feel more pessimistic about the future than I used to." },
      { score: 2, text: "I do not expect things to work out for me." },
      { score: 3, text: "I feel that the future is hopeless and that things cannot improve." }
    ]
  },
  {
    id: 3,
    category: "Past Failure",
    options: [
      { score: 0, text: "I do not feel like a failure." },
      { score: 1, text: "I have failed more than I should have." },
      { score: 2, text: "As I look back on my life, all I can see is a lot of failures." },
      { score: 3, text: "I feel I am a total failure as a person." }
    ]
  },
  {
    id: 4,
    category: "Loss of Pleasure",
    options: [
      { score: 0, text: "I get as much pleasure as I ever did from the things I enjoy." },
      { score: 1, text: "I don't enjoy things as much as I used to." },
      { score: 2, text: "I get very little pleasure from the things I used to enjoy." },
      { score: 3, text: "I can't get any pleasure from the things I used to enjoy." }
    ]
  },
  {
    id: 5,
    category: "Guilty Feelings",
    options: [
      { score: 0, text: "I don't feel particularly guilty." },
      { score: 1, text: "I feel guilty over many things I have done or should have done." },
      { score: 2, text: "I feel quite guilty most of the time." },
      { score: 3, text: "I feel guilty all of the time." }
    ]
  },
  {
    id: 6,
    category: "Punishment Feelings",
    options: [
      { score: 0, text: "I don't feel I am being punished." },
      { score: 1, text: "I feel I may be punished." },
      { score: 2, text: "I expect to be punished." },
      { score: 3, text: "I feel I am being punished." }
    ]
  },
  {
    id: 7,
    category: "Self-Dislike",
    options: [
      { score: 0, text: "I feel the same about myself as ever." },
      { score: 1, text: "I have lost confidence in myself." },
      { score: 2, text: "I am disappointed in myself." },
      { score: 3, text: "I dislike myself." }
    ]
  },
  {
    id: 8,
    category: "Self-Criticalness",
    options: [
      { score: 0, text: "I don't criticize or blame myself more than usual." },
      { score: 1, text: "I am more critical of myself than I used to be." },
      { score: 2, text: "I criticize myself for all of my faults." },
      { score: 3, text: "I blame myself for everything bad that happens." }
    ]
  },
  {
    id: 9,
    category: "Suicidal Thoughts or Wishes",
    options: [
      { score: 0, text: "I don't have any thoughts of killing myself." },
      { score: 1, text: "I have thoughts of killing myself, but I would not carry them out." },
      { score: 2, text: "I would like to kill myself." },
      { score: 3, text: "I would kill myself if I had the chance." }
    ]
  },
  {
    id: 10,
    category: "Crying",
    options: [
      { score: 0, text: "I don't cry any more than I used to." },
      { score: 1, text: "I cry more than I used to." },
      { score: 2, text: "I cry over every little thing." },
      { score: 3, text: "I feel like crying, but I can't." }
    ]
  },
  {
    id: 11,
    category: "Agitation",
    options: [
      { score: 0, text: "I am no more restless or wound up than usual." },
      { score: 1, text: "I feel more restless or wound up than usual." },
      { score: 2, text: "I am so restless or agitated that it's hard to stay still." },
      { score: 3, text: "I am so restless or agitated that I have to keep moving or doing something." }
    ]
  },
  {
    id: 12,
    category: "Loss of Interest",
    options: [
      { score: 0, text: "I have not lost interest in other people or activities." },
      { score: 1, text: "I am less interested in other people or things than before." },
      { score: 2, text: "I have lost most of my interest in other people and have little feeling for them." },
      { score: 3, text: "I have lost all of my interest in other people and don't care about them at all." }
    ]
  },
  {
    id: 13,
    category: "Indecisiveness",
    options: [
      { score: 0, text: "I make decisions about as well as ever." },
      { score: 1, text: "I find it more difficult to make decisions than usual." },
      { score: 2, text: "I have much greater difficulty in making decisions than I used to." },
      { score: 3, text: "I can't make any decisions at all anymore." }
    ]
  },
  {
    id: 14,
    category: "Worthlessness",
    options: [
      { score: 0, text: "I do not feel I am worthless." },
      { score: 1, text: "I don't consider myself as worthwhile and useful as I used to." },
      { score: 2, text: "I feel more worthless as compared to other people." },
      { score: 3, text: "I feel utterly worthless." }
    ]
  },
  {
    id: 15,
    category: "Loss of Energy",
    options: [
      { score: 0, text: "I have as much energy as ever." },
      { score: 1, text: "I have less energy than I used to have." },
      { score: 2, text: "I don't have enough energy to do very much." },
      { score: 3, text: "I don't have enough energy to do anything." }
    ]
  },
  {
    id: 16,
    category: "Changes in Sleeping Pattern",
    options: [
      { score: 0, text: "I have not experienced any change in my sleeping pattern." },
      { score: 1, text: "I sleep somewhat more or less than usual." },
      { score: 2, text: "I sleep a lot more or less than usual." },
      { score: 3, text: "I sleep most of the day or I wake up 1-2 hours early and can't get back to sleep." }
    ]
  },
  {
    id: 17,
    category: "Irritability",
    options: [
      { score: 0, text: "I am no more irritable than usual." },
      { score: 1, text: "I am more irritable than usual." },
      { score: 2, text: "I am much more irritable than usual." },
      { score: 3, text: "I am irritable all the time." }
    ]
  },
  {
    id: 18,
    category: "Changes in Appetite",
    options: [
      { score: 0, text: "I have not experienced any change in my appetite." },
      { score: 1, text: "My appetite is somewhat less or greater than usual." },
      { score: 2, text: "My appetite is much less or greater than usual." },
      { score: 3, text: "I have no appetite at all or I crave food all the time." }
    ]
  },
  {
    id: 19,
    category: "Concentration Difficulty",
    options: [
      { score: 0, text: "I can concentrate as well as ever." },
      { score: 1, text: "I can't concentrate as well as usual." },
      { score: 2, text: "It's hard to keep my mind on anything for very long." },
      { score: 3, text: "I find I can't concentrate on anything." }
    ]
  },
  {
    id: 20,
    category: "Tiredness or Fatigue",
    options: [
      { score: 0, text: "I am no more tired or fatigued than usual." },
      { score: 1, text: "I get tired or fatigued more easily than usual." },
      { score: 2, text: "I am too tired or fatigued to do a lot of the things I used to do." },
      { score: 3, text: "I am too tired or fatigued to do most of the things I used to do." }
    ]
  },
  {
    id: 21,
    category: "Loss of Interest in Sex",
    options: [
      { score: 0, text: "I have not noticed any recent change in my interest in sex." },
      { score: 1, text: "I am less interested in sex than I used to be." },
      { score: 2, text: "I am much less interested in sex now." },
      { score: 3, text: "I have lost interest in sex completely." }
    ]
  }
];
