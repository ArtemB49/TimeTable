
/* Страницы Бэкенда */
const { Pool } = require('pg');
const pool = new Pool(require('./postgres'));
const currentWeekNumber = require('current-week-number');
const Intl = require("intl");
const express = require('express');
const auth = require('./auth');
const checkAuth = auth.checkAuth;






module.exports = app => {
    app.get('/', checkAuth,  async (request, response) => {
        try{
            const poolClient = await pool.connect()
            const dates = await poolClient.query(`
                SELECT date
                FROM dates
                GROUP BY date
            `);
            poolClient.release();
    
            const weeks = {};
    
            dates.rows.forEach((item) =>{
                var date = new Date(item.date);
    
                var optionsRU = {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric" 
                };
    
                var optionsNumeric = {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric" 
                };
                
                var dateRU = new Intl.DateTimeFormat('ru-RU', optionsRU).format(date);
                var dateNum = new Intl.DateTimeFormat('ru-RU', optionsNumeric).format(date);
                var weekNumber = currentWeekNumber(date);
                
                if (weeks[weekNumber] == undefined) {
                    weeks[weekNumber] = {
                        friday: '',
                        friday_ru: '',
                        saturday: '',
                        saturday_ru: ''
                    };
                } 
                switch (date.getDay()) {
                    case 5:
                        weeks[weekNumber].friday_ru = dateRU;
                        weeks[weekNumber].friday = dateNum;
                        break;
                    case 6:
                        weeks[weekNumber].saturday_ru = dateRU;
                        weeks[weekNumber].saturday = dateNum;
                        break;    
                
                    default:
                        break;
                }         
                          
            });
    
            const weeksArray = [];
    
            for (const key in weeks) {
                if (weeks.hasOwnProperty(key)) {
                    const element = weeks[key];
                    weeksArray.push(element);
                }
            }
            console.log(weeksArray);
            
            response.render('index', {weeks: weeksArray});
    
        } catch(err){
            console.log(err);
        } 
            
    });
    
    // Не используется
    app.get('/table', async (request, response) => {
        try{
            const poolClient = await pool.connect()
            const classiesDay1Time1 = await poolClient.query(queryDay, [1, '2015-01-01']);
            const classiesDay1Time2 = await poolClient.query(queryDay, [2, '2015-01-01']);
            const classiesDay1Time3 = await poolClient.query(queryDay, [3, '2015-01-01']);
            
            const classiesDay2Time1 = await poolClient.query(queryDay, [4, '2015-01-01']); 
            const classiesDay2Time2 = await poolClient.query(queryDay, [5, '2015-01-01']); 
            const classiesDay2Time3 = await poolClient.query(queryDay, [6, '2015-01-01']); 
            const classiesDay2Time4 = await poolClient.query(queryDay, [7, '2015-01-01']); 
             
            const teachers = await poolClient.query('SELECT*FROM teachers');
            const lessons = await poolClient.query('SELECT*FROM lessons');
                
                
            console.log(classiesDay1Time1.rows);
            console.log(classiesDay1Time2.rows);
            console.log(classiesDay1Time3.rows);
                
            
    
    
            const coutnOfGroups = await poolClient.query(`
                SELECT COUNT(*)
                FROM classes 
                INNER JOIN groups_of_class AS gfc
                ON classes.id = gfc.class_id
                WHERE date_id = 1
            `);
    
            response.render('table', {
                classiesDay1Time1: classiesDay1Time1.rows,
                classiesDay1Time2: classiesDay1Time2.rows,
                classiesDay1Time3: classiesDay1Time3.rows,
    
                classiesDay2Time1: classiesDay2Time1.rows,
                classiesDay2Time2: classiesDay2Time2.rows,
                classiesDay2Time3: classiesDay2Time3.rows,
                classiesDay2Time4: classiesDay2Time4.rows,
    
                teachers: teachers.rows,
                lessons: lessons.rows
            });
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }     
        
    });
    
    // Добавление нового дня
    app.post('/add-day', checkAuth, async function(request, response){
        const poolClient = await pool.connect()
        for (let index = 1; index < 4; index++) {
            await poolClient.query('INSERT INTO dates(date, time_id) VALUES($1, $2)', [request.body.friday, index]);      
        }
        for (let index = 4; index < 8; index++) {
            await poolClient.query('INSERT INTO dates(date, time_id) VALUES($1, $2)', [request.body.saturday, index]);                
        }    
    
        poolClient.release();
        response.redirect('/');
    });
    
    // Справочники
    app.get('/list/:name', checkAuth, async (request, response) => {
        
        try{       
            const poolClient = await pool.connect()
            var items;
            var active;
            var label;
            switch (request.params.name) {
                case 'lessons':
                    items = await poolClient.query('SELECT*FROM lessons');
                    active = 'lessons';
                    label = 'Занятие';
                break;
    
                case 'teachers':
                    items = await poolClient.query('SELECT*FROM teachers');
                    active = 'teachers'
                    label = 'Преподаватель';
                break;
    
                case 'groups':
                    items = await poolClient.query('SELECT*FROM groups');
                    active = 'groups'
                    label = 'Группа';
                break;
        
                default:
    
                    break;
            }
    
            response.render(
                'lists',
                {
                    active: active,
                    items: items.rows,
                    label: label
                });
    
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }
    });
    
    app.get('/list/', checkAuth, async (request, response) => {
        response.redirect('/list/lessons/');
    });
    
    // Добавление нового дня
    app.post('/add/:table', async function(request, response){
    
        console.log( request.params.table);
        console.log( request.body.item);
        
    
        const poolClient = await pool.connect()
    
        switch (request.params.table) {
            case 'teachers':
            case 'lessons':
    
                await poolClient.query("INSERT INTO " + request.params.table + "(name) VALUES($1)",
                    [
                    request.body.item
                    ]);  
            break;
    
            case 'groups':
                await poolClient.query("INSERT INTO groups(name, year_admission, students_count) VALUES($1, $2, $3)",
                    [
                        request.body.item,
                        "01/01/" + request.body.year,
                        request.body.count
                    ]);
            break;
        
            default:
                break;
        }
        
           
        //await poolClient.query()
        
    
        poolClient.release();
        response.redirect(request.get('referer'));
    });
    
    // Не используется
    app.delete('/delete/:id', async function(request, response){
        const poolClient = await pool.connect()
        await poolClient.query('DELETE FROM recipes WHERE id = $1',
        [request.params.id]);
    
        poolClient.release();
    
        response.sendStatus(200);
    });
    
    // Изменение занятия
    app.post('/edit/:table', checkAuth, async function(request, response){
        const poolClient = await pool.connect()
        switch (request.params.table) {
            case 'classes':
                await poolClient.query('UPDATE classes SET lesson_id=$1, teacher_id=$2 WHERE id = $3',
                    [
                        request.body.lesson_id,
                        request.body.teacher_id,
                        request.body.class_id
                    ]
                );
            break;
    
            case 'groups':
                await poolClient.query('UPDATE groups SET name=$1, year_admission=$2, students_count=$3 WHERE id = $4',
                    [
                        request.body.item,
                        "01/01/" + request.body.year,
                        request.body.count,
                        request.body.item_id
                    ]
                );
            break;
    
            case 'teachers':
                await poolClient.query('UPDATE teachers SET name=$1 WHERE id = $2',
                    [
                        request.body.item,
                        request.body.item_id
                    ]
                );
            break;
    
            case 'lessons':
                await poolClient.query('UPDATE lessons SET name=$1 WHERE id = $2',
                    [
                        request.body.item,
                        request.body.item_id
                    ]
                );
            break;
        
            default:
                break;
        }
        
    
        poolClient.release();
        response.redirect(request.get('referer'));
    });
    
    // Список занятий на оптеределенные даты 
    app.get('/day/:year/:friday&:saturday', checkAuth, async function(request, response) {
        
        const friday = request.params.friday;
        const saturday = request.params.saturday;
        const year = request.params.year + "-01-01";
        
        try{
            const poolClient = await pool.connect()
            const datesResult = await poolClient.query(`
                SELECT id 
                FROM dates 
                WHERE date IN ($1, $2)`,
                [ 
                    friday,
                    saturday,
                ]
            );
            const datesRows = datesResult.rows;
    
            console.log(datesRows);
    
            const classesOfWeekend = [];
            
            for (let i = 0; i < datesRows.length; i++) {
                const dateRow = datesRows[i];
                var classiesAtTime = await poolClient.query(queryDay, [dateRow.id, year]);
                var time = classiesAtTime.rows[0].time;
                var dayOfWeek = weekday[(new Date(classiesAtTime.rows[0].date)).getDay()];
                classesOfWeekend.push(
                    {
                        classies: classiesAtTime.rows,
                        time: time,
                        day: dayOfWeek
                    }
                );
            }        
            console.log(classesOfWeekend);
    
            const groups = [];
            classesOfWeekend[0].classies.forEach((classes)=>{
                groups.push({group: classes.group});
            })
    
            
            console.log(groups); 
            const teachers = await poolClient.query('SELECT*FROM teachers'); 
            const lessons = await poolClient.query('SELECT*FROM lessons');
            
            const coutnOfGroups = await poolClient.query(`
                SELECT COUNT(*)
                FROM classes 
                INNER JOIN groups_of_class AS gfc
                ON classes.id = gfc.class_id
                WHERE date_id = 1
            `);
    
            const years = [
                { year: '2015' },
                { year: '2016' },
                { year: '2017' },
                { year: '2018' },
            ];
    
            response.render('days', {
                
                classesOfWeekend: classesOfWeekend,
                teachers: teachers.rows,
                lessons: lessons.rows,
                groups: groups,
                years: years,
                current_year: request.params.year,
                friday: friday,
                saturday: saturday,
            });
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }     
    
    });
    
    
    
};

// Запрос на получение списка занятий на определенный день
const queryDay = `
SELECT
    cl.id, 
    lessons.name AS lesson,
    teachers.name AS teacher,
    lessons.id AS lesson_id,
    teachers.id AS teacher_id,
    gr.name AS group,
    dt.date AS date,
    ti.time AS time

FROM ((((((public.classes AS cl
INNER JOIN public.lessons
ON lessons.id = lesson_id)
INNER JOIN public.teachers
ON teachers.id = teacher_id)
INNER JOIN groups_of_class AS gs
ON gs.class_id = cl.id)
INNER JOIN groups AS gr
ON gs.group_id = gr.id)
INNER JOIN dates AS dt
ON dt.id = cl.date_id)
INNER JOIN times AS ti
ON ti.id = dt.time_id)

WHERE date_id = $1
AND year_admission = $2

ORDER BY gr.name;`;

var weekday = new Array(7);
weekday[0] =  "Воскресение";
weekday[1] = "Понедельник";
weekday[2] = "Вторник";
weekday[3] = "Среда";
weekday[4] = "Четверг";
weekday[5] = "Пятница";
weekday[6] = "Суббота";




