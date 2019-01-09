// Изменение занятия кнопка сохранить
$('.edit-class').on('click', function(){
    $('#edit-form-lesson').val($(this).data('lesson'));
    $('#edit-form-teacher').val($(this).data('teacher'));
    $('#edit-form-room').val($(this).data('room'));
    $('#edit-form-id').val($(this).data('id'));
    $('#edit-form-lesson_id').val($(this).data('lesson_id'));
    $('#edit-form-teacher_id').val($(this).data('teacher_id'));
    $('#edit-form-room_id').val($(this).data('room_id'));
})

$('.edit-item').on('click', function(){
    $('#edit-form-item').val($(this).data('name'));
    $('#edit-form-id').val($(this).data('item_id'));
    $('#edit-form-group-count').val($(this).data('count'));
    var year = new Date($(this).data('year'));
    $('#edit-form-group-year').val(year.getFullYear());
})


// Выбор учителя в выпадающем списке
$('.edit-teacher').on('click', function(){
    $('#edit-form-teacher').val($(this).data('name'));
    $('#edit-form-teacher_id').val($(this).data('teacher_id'));
    showListOfTeachers();
});

// Выбор учителя в выпадающем списке
$('.edit-lesson').on('click', function(){
    $('#edit-form-lesson').val($(this).data('name'));
    $('#edit-form-lesson_id').val($(this).data('lesson_id'));
    showListOfLessons()
});


$(document).ready(function(){
    $('.delete-recipe').on('click', function(){
        var id = $(this).data('id');
        var url = '/delete/'+ id;
        if (confirm('Delete Recipe?')){
            $.ajax({
               url: url,
               type: 'DELETE',
               success: function(result){
                   console.log('Deleting Recipe...');
                   window.location.href = '/';                   
               },
               error: function(err){
                   console.log(err);
               } 
            });
        }
    });
});

$(document).ready(function(){

    $('.open-day').on('click', function(){
        var friday = $(this).data('friday');
        var saturday = $(this).data('saturday');
        var url = '/day/'+ friday + '&' + saturday;
        
            $.ajax({
               url: url,
               type: 'GET',
               success: function(result){
                   console.log('Open day');
                   window.location.href = '/';                   
               },
               error: function(err){
                   console.log(err);
               } 
            });
        
    });
});

// Выпадающий список учителей 
function showListOfTeachers() {
    document.getElementById("listOfTeachersDropdown").classList.toggle("show");
  }
// Поиск по выпадающему списку учителей  
function filterTeachers() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("searchTeachers");
    filter = input.value.toUpperCase();
    div = document.getElementById("listOfTeachersDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  }

function showListOfLessons() {
    document.getElementById("listOfLessonsDropdown").classList.toggle("show");
}
  
function filterLessons() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("searchLessons");
    filter = input.value.toUpperCase();
    div = document.getElementById("listOfLessonsDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  }

/**
 * Datetimepicker
 */

$(document).ready(function(){
    $('#datetimepicker5').datetimepicker({
        locale: 'ru',
        format: 'L'
    });
    $('#datetimepicker6').datetimepicker({
        locale: 'ru',
        format: 'L'
    });  
});