import {ChartConfiguration, Tick, TooltipItem} from "chart.js";
import {User} from "@interfaces";
import {UserGender} from "@types";

interface EngineByGenderStat {
  engine: string,
  male: number,
  female: number,
  userCounter: number
}
function calculateAge(birthdate: string) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

type Age = number;
type Color = string;
type UserCounterByColor = number;
type ColorCounter = number;
export function mostPickedColorsByAgeConf(users: User[]) {
  const colorsSet = new Set<Color>(users.map(el => el.color));

  const colorCounter = Array.from(colorsSet).reduce((acc, key) => {
    acc.set(key, 0)
    return acc;
  }, new Map<Color, ColorCounter>());

  const colorByAgeMap = users.reduce((acc, user) => {
    const age: Age = calculateAge(user.birthday)
    if (!acc.has(age)) {
      const newColorMap = new Map<Color, UserCounterByColor>();
      Array.from(colorsSet).forEach(c => newColorMap.set(c, 0))
      acc.set(age, newColorMap)
    }
    const colorMap = acc.get(age)!;
    const userColor: Color = user.color;
    colorMap.set(userColor, colorMap.get(userColor)! + 1)
    colorCounter.set(userColor, colorCounter.get(userColor)! + 1)
    return acc
  }, new Map<Age, Map<Color, UserCounterByColor>>());

  const sortedColorByAgeArr = Array.from(colorByAgeMap.entries())
    .sort((a, b) => a[0] - b[0]);

  const ageLabels = sortedColorByAgeArr.map(e => e[0]);

  const colorsArr = Array.from(colorCounter.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);

  const ageDataset: {label: string, data: number[], backgroundColor: string[]}[] = colorsArr.map(c => {
    return {
      label: `${c} (${colorCounter.get(c)})`,
      data: ageLabels.map(a => {
        return colorByAgeMap.get(a)!.get(c)!
      }),
      backgroundColor: new Array(ageLabels.length).fill(c),
      stack: c
    }
  });

  const data = {
    labels: ageLabels,
    datasets: ageDataset
  };

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Most picked colors by age',
          font: {
            weight: 'bold',
            size: 23,
          },
        },
        legend: {
          position: 'top',
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          stacked: true,
        }
      }
    }
  };
  return config;
}
export function mostPickedEngineByGenderConf(users: User[]) {
  const genderStat: Map<UserGender, number> = new Map();
  const formattedMapStat = users.reduce((acc, user) => {
    const engine = user.engine;
    if (!acc.has(engine)) {
      acc.set(engine, {
        engine,
        male: 0,
        female: 0,
        userCounter: 0
      });
    }
    const stat: EngineByGenderStat = acc.get(engine)!;
    stat.userCounter = stat.userCounter + 1;
    stat[user.gender] = stat[user.gender] + 1;
    genderStat.has(user.gender) ? genderStat.set(user.gender, genderStat.get(user.gender)! + 1): genderStat.set(user.gender, 1);
    acc.set(engine, stat)
    return acc;
  }, new Map<string, EngineByGenderStat>());
  const labels = Array.from(formattedMapStat.values()).map(el => {
    return `${el.engine}`
  });

  const datasets: {
    label: string,
    data: number[],
    stack: string,
  }[] =  Array.from(genderStat.entries()).map(e => {
    const gender = e[0];

    const data: number[] = [];
    Array.from(formattedMapStat.values()).forEach(el => {
      data.push(el[gender])
    })

    return{
      label: `${gender} (${genderStat.get(gender)})`,
      data,
      stack: gender
    }
  });

  const data = {
    labels,
    datasets
  };
  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data,
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: users.length,
          ticks: {
            callback: (tickValue: number | string, index: number, ticks: Tick[]) => `${tickValue}`
          }
        }
      },
      interaction: {
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Most picked engine type by gender',
          font: {
            weight: 'bold',
            size: 23,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              return `${context.dataset.stack}: ${context.formattedValue}`;
            }
          }
        }
      }
    }
  };

  return config
}
export function mostCommonHobbyConf(users: User[]) {
  const formattedMapStat = users.reduce((acc, user) => {
    user.hobby.forEach(h => {
      acc.has(h) ? acc.set(h, acc.get(h)! + 1) : acc.set(h, 1);
    })
    return acc;
  }, new Map<string, number>())

  const labels: string[] = [];
  const datasetsData: number[] = [];
  const dataEntries = Array.from(formattedMapStat.entries()).sort((a, b) => b[1] - a[1]);
  dataEntries.forEach(el => {
    labels.push(`${el[0]}: ${el[1]}`);
    datasetsData.push(el[1]);
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'count: ',
        data: datasetsData,
      }
    ]
  };
  const config : ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Most common hobby amongst visitors',
          font: {
            weight: 'bold',
            size: 23,
          },
        },
        legend: {
          position: 'top',
        }
      }
    },
  };
  return config
}
