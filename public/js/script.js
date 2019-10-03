function dropDown(){
  var x = document.getElementById('myNav');
  if(x.className === 'nav'){
    x.className += ' list';
  }
  else{
    x.className = 'nav';
  }
}