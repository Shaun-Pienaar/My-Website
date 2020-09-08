function dropDown(){
  var x = document.getElementById('myNav');
  if(x.className === 'nav'){
    x.className += ' list';
  }
  else{
    x.className = 'nav';
  }
}

function switchClass(){
  //let tops = document.getElementsByClassName('top');
  let proj = document.getElementById('project1');
  let tops = proj.childNodes;
  for(let i = 0; i < tops.length; i++){
    if(tops[i].className == 'top'){
      tops[i].className='bottom';
      continue;
    }
    if(tops[i].className == 'bottom'){
      tops[i].className='top';
    }
  }
}

function switchClass2(){
  //let tops = document.getElementsByClassName('top');
  let proj = document.getElementById('project2');
  let tops = proj.childNodes;
  for(let i = 0; i < tops.length; i++){
    if(tops[i].className == 'top'){
      tops[i].className='bottom';
      continue;
    }
    if(tops[i].className == 'bottom'){
      tops[i].className='top';
    }
  }
}

function switchClass3(){
  //let tops = document.getElementsByClassName('top');
  let proj = document.getElementById('project3');
  let tops = proj.childNodes;
  for(let i = 0; i < tops.length; i++){
    if(tops[i].className == 'top'){
      tops[i].className='bottom';
      continue;
    }
    if(tops[i].className == 'bottom'){
      tops[i].className='top';
    }
  }
}

function switchClass4(){
  //let tops = document.getElementsByClassName('top');
  let proj = document.getElementById('project4');
  let tops = proj.childNodes;
  for(let i = 0; i < tops.length; i++){
    if(tops[i].className == 'top'){
      tops[i].className='bottom';
      continue;
    }
    if(tops[i].className == 'bottom'){
      tops[i].className='top';
    }
  }
}