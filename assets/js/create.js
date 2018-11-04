// code for tag seperation
var Months=['January','February','March','April','May','June','July','August','September','October','November','December'];


$(function(){

  $('.tags input').on('focusout',function(){    
    var txt= this.value.replace(/[^a-zA-Z0-9\+\-\.\#]/g,''); // allowed characters
    if(txt) {
      $(this).before('<span class="tag">'+ txt.toLowerCase() +'</span>');
    }
    this.value="";
  }).on('keyup',function( event ){
    // if: comma,enter (delimit more keyCodes with | pipe)
    if(/(188|13)/.test(event.which)){ $(this).focusout(); 
    }
  });
   
  $('.tags').on('click','.tag',function(){
    $(this).remove();  
  });
});

function nth(d) {
  if(d>3 && d<21) return 'th'; // thanks kennebec
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

var Thedate = new Date(),
      date = Thedate.getDate(), 
      mon = Thedate.getMonth();

var today = date+nth(date)+" "+Months[mon];

// submit code

$('#submit').click(function(){
  var title = $('.title').val();
  var tags = $('.tag');
  var cont = $('.cont').val();
  if(title==""||tags.length==0||cont==""){
    alert('Please fill all details');
  }else{
    if(tags.length!=0){
      var tagStr=tags[0].innerText;
    }
    for(i=1;i<tags.length;i++){
      tagStr=tagStr+","+tags[i].innerText;
    }
    console.log(title);
    console.log(tagStr);
    console.log(cont);
    console.log(today)
    var myKeyVals = {title: title,tags: tagStr,content: cont,created_on: today};

      console.log(myKeyVals);
      $.ajax({
          type: 'POST',
          url: "/view",
          data: myKeyVals,
          success: function(resultData) { alert('The Blog has been added Successfully !'); window.location.reload(); }
      });
  }
});

