const { TASK_TYPES } = require('~/helpers/constants');

const TASK_MAZE = {
    type: TASK_TYPES.MAZE,
    info: {
        maze: [
            [ 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 1, 1, 1, 0, 1, 0, 0 ],
            [ 0, 1, 0, 0, 0, 0, 1, 0 ],
            [ 0, 1, 0, 1, 1, 1, 1, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, -1 ],
        ],
        playerPos: [0, 0],
        points: 4,
        maxActions: 12,
    },
};

const TASK_TEST = {
    type: TASK_TYPES.TEST,
    info: [
        {
            type: 'select',
            question: 'Что не является потреблением?',
            points: 2,
            choices: [
                {
                    i: 1,
                    с: 'машина',
                },
                {
                    i: 2,
                    с: 'одежда',
                },
                {
                    i: 3,
                    с: 'знаковая субстанция',
                },
                {
                    i: 4,
                    с: 'свободный рынок',
                },
            ]
        },
        {
            type: 'fill',
            question: 'Оператор сложения {{__blank__}}',
            points: 5,
        },
        {
            type: 'match',
            text: 'Каждый {{__blank__}} имеет свой {{__blank__}}, причем уникальный для каждого {{__blank__}}',
            points: 10,
            choices: [
                {
                    i: 1,
                    с: 'человек',
                },
                {
                    i: 2,
                    с: 'дом',
                },
                {
                    i: 3,
                    с: 'человека',
                }
            ]
        }
    ],
    answer: {
        [TASK_TYPES.TEST]: [
            {
                answer: [1, 2]
            },
            {
                answer: ['коммутативен']
            },
            {
                answer: [1, 2, 3]
            }
        ]
    }
};
module.exports = {
    TASK_TEST,
    TASK_MAZE
};