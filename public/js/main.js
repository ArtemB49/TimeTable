$('.edit-recipe').on('click', function(){
    $('#edit-form-lesson').val($(this).data('lesson'));
    $('#edit-form-teacher').val($(this).data('teacher'));
    $('#edit-form-room').val($(this).data('room'));
    $('#edit-form-id').val($(this).data('id'));
})

$('.edit-teacher').on('click', function(){
    $('#edit-form-teacher').val($(this).data('name'));
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
    $('#datetimepicker4').datetimepicker();

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

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
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

$(function () {
    
});