
/* API приложения */

const pool = require('./postgres');
const express = require('express');


module.exports = app => {

    // Список занятий группы
    app.get('/api/classies/:group_id', async function(request, response) {
    
        const groupID = request.params.group_id;
        
        try{
            const poolClient = await pool.connect()
            var classiesOfGroup = await poolClient.query(queryClassiesOfGroup, [groupID]);
                
    
            response.json(
                {            
                    classies: classiesOfGroup.rows
                }
            );
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }     
    
    });
    
    // Список учителей
    app.get('/api/teachers', async function(request, response) {
        
        const groupID = request.params.group_id;
        
        try{
            const poolClient = await pool.connect()
            var teachers = await poolClient.query("SELECT*FROM teachers");
                
    
            response.json(
                {            
                    teachers: teachers.rows
                }
            );
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }     
    
    });
    
    // Список занятий группы
    app.get('/api/teachers/:teacher_id', async function(request, response) {
        
        const teacherID = request.params.teacher_id;
        
        try{
            const poolClient = await pool.connect()
            var exercisesByTeacher = await poolClient.query(queryExercisesByTeacher, [teacherID]);
                
    
            response.json(
                {            
                    classies: exercisesByTeacher.rows
                }
            );
            poolClient.release();
        } catch(err){
            console.log(err);
            poolClient.release();
        }     
    
    });
};

const queryClassiesOfGroup = `

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

WHERE gr.id = $1
AND dt.date > now()

ORDER BY dt.date, ti.time`;

const queryExercisesByTeacher = `

SELECT
    cl.id, 
    le.name AS lesson,
    te.name AS teacher,
    le.id AS lesson_id,
    te.id AS teacher_id,
    gr.name AS group,
    dt.date AS date,
    ti.time AS time

FROM ((((((public.classes AS cl
INNER JOIN public.lessons AS le
ON le.id = lesson_id)
INNER JOIN public.teachers AS te
ON te.id = teacher_id)
INNER JOIN groups_of_class AS gs
ON gs.class_id = cl.id)
INNER JOIN groups AS gr
ON gs.group_id = gr.id)
INNER JOIN dates AS dt
ON dt.id = cl.date_id)
INNER JOIN times AS ti
ON ti.id = dt.time_id)

WHERE te.id = $1
AND dt.date > now()

ORDER BY dt.date, ti.time; `;
