var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var dust = require('dustjs-helpers');
var currentWeekNumber = require('current-week-number');
var Intl = require("intl");
var app = express();

const { Pool } = require('pg');

// DB Connect

const pool = new Pool({
    connectionString: 'postgres://postgres:32243551@localhost/hse',
    port: 5432,
    user: 'artem',
    password: '4355',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000 
});

// 
app.engine('dust', cons.dust);

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', async (request, response) => {
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
        });
        poolClient.release();
    } catch(err){
        console.log(err);
        poolClient.release();
    }     
    
});

app.post('/add-day', async function(request, response){
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

app.delete('/delete/:id', async function(request, response){
    const poolClient = await pool.connect()
    await poolClient.query('DELETE FROM recipes WHERE id = $1',
    [request.params.id]);

    poolClient.release();

    response.sendStatus(200);
});

app.post('/edit', async function(request, response){
    const poolClient = await pool.connect()
    await poolClient.query('UPDATE classes SET lesson_id=$1, teacher_id=$2 WHERE id = $3',
        [
            request.body.lesson,
            request.body.teacher,
            //request.body.room,
            request.body.class_id
        ]
    );

    poolClient.release();
    response.redirect('/');
});

app.get('/day/:friday&:saturday', async function(request, response) {
    
    
    console.log(request.params.date);
    
    try{
        const poolClient = await pool.connect()
        const datesResult = await poolClient.query(`
            SELECT id 
            FROM dates 
            WHERE date IN ($1, $2)`,
            [ 
                request.params.friday,
                request.params.saturday,
            ]
        );
        const datesRows = datesResult.rows;

        console.log(datesRows);

        const classesOfWeekend = [];
        
        for (let i = 0; i < datesRows.length; i++) {
            const dateRow = datesRows[i];
            var classiesAtTime = await poolClient.query(queryDay, [dateRow.id, '2015-01-01']);
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
        
        
        const coutnOfGroups = await poolClient.query(`
            SELECT COUNT(*)
            FROM classes 
            INNER JOIN groups_of_class AS gfc
            ON classes.id = gfc.class_id
            WHERE date_id = 1
        `);

        response.render('days', {
            
            classesOfWeekend: classesOfWeekend,
            teachers: teachers.rows,
            groups: groups,
        });
        poolClient.release();
    } catch(err){
        console.log(err);
        poolClient.release();
    }     

});

// Server
app.listen(2000, function(){
    console.log('Server Started On Port 2000');
});


const queryDay = `
SELECT
    cl.id, 
    lessons.name AS lesson,
    teachers.name AS teacher,
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

