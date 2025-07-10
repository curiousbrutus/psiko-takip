
export type AssessmentQuestion = {
  id: string;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
};

export type Assessment = {
  name: 'GAD-7' | 'PHQ-9' | 'TherapeuticAlliance';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
};

export const assessments: Assessment[] = [
  {
    name: 'GAD-7',
    title: 'Yaygın Anksiyete Bozukluğu-7 (GAD-7)',
    description: 'Son 2 hafta içinde, aşağıdaki sorunlar tarafından ne sıklıkla rahatsız edildiniz?',
    questions: [
      {
        id: 'q1',
        text: 'Gergin, endişeli veya sinirli hissetme',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
      {
        id: 'q2',
        text: 'Endişelenmeyi durduramama veya kontrol edememe',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
       {
        id: 'q3',
        text: 'Farklı şeyler hakkında çok fazla endişelenme',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
       {
        id: 'q4',
        text: 'Rahatlamada zorluk çekme',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
       {
        id: 'q5',
        text: 'O kadar huzursuz olma ki yerinde durmak zor',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
       {
        id: 'q6',
        text: 'Kolayca sinirlenme veya alıngan olma',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
       {
        id: 'q7',
        text: 'Kötü bir şey olacakmış gibi korkma hissi',
        options: [
          { text: 'Hiç', score: 0 },
          { text: 'Birkaç gün', score: 1 },
          { text: 'Yarıdan fazla gün', score: 2 },
          { text: 'Neredeyse her gün', score: 3 },
        ],
      },
    ],
  },
  {
    name: 'PHQ-9',
    title: 'Hasta Sağlık Anketi-9 (PHQ-9)',
    description: 'Son 2 hafta içinde, aşağıdaki sorunlar tarafından ne sıklıkla rahatsız edildiniz?',
    questions: [
      // PHQ-9 questions can be added here following the same structure
    ],
  },
   {
    name: 'TherapeuticAlliance',
    title: 'Terapötik İttifak Anketi',
    description: 'Lütfen terapistiniz ve seanslarınız hakkındaki düşüncelerinizi paylaşın.',
    questions: [
      {
        id: 'a1',
        text: 'Terapistimin beni anladığını hissediyorum.',
        options: [
          { text: 'Kesinlikle Katılmıyorum', score: 1 },
          { text: 'Katılmıyorum', score: 2 },
          { text: 'Kararsızım', score: 3 },
          { text: 'Katılıyorum', score: 4 },
          { text: 'Kesinlikle Katılıyorum', score: 5 },
        ],
      },
       {
        id: 'a2',
        text: 'Seanslarımızın hedeflerimize yönelik ilerlediğini düşünüyorum.',
        options: [
          { text: 'Kesinlikle Katılmıyorum', score: 1 },
          { text: 'Katılmıyorum', score: 2 },
          { text: 'Kararsızım', score: 3 },
          { text: 'Katılıyorum', score: 4 },
          { text: 'Kesinlikle Katılıyorum', score: 5 },
        ],
      },
       {
        id: 'a3',
        text: 'Terapistime güvendiğimi hissediyorum.',
        options: [
          { text: 'Kesinlikle Katılmıyorum', score: 1 },
          { text: 'Katılmıyorum', score: 2 },
          { text: 'Kararsızım', score: 3 },
          { text: 'Katılıyorum', score: 4 },
          { text: 'Kesinlikle Katılıyorum', score: 5 },
        ],
      },
    ],
  },
];
