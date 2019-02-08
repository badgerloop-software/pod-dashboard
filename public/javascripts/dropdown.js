/*
Author: Luke Houge, Eric Udlis
Purpose: Enable dynamic and searchable dropdowns
*/

// determines which dropdown is being triggered
function dropdown(num) {
  document.getElementById(`myDropdown${String(num)}`).classList.toggle('show');
}

// search filter function for  dropdowns
function filterFunction(id) {
  // determines which dropdown (1,2, or 3) is being called
  const inputnum = String(`dropdownInput${id}`);

  // filter function
  let i;
  const input = document.getElementById(inputnum);
  const filter = input.value.toUpperCase();
  const div = document.getElementById(`myDropdown${String(id)}`);
  const a = div.getElementsByTagName('a');
  for (i = 0; i < a.length; i += 1) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = '';
    } else {
      a[i].style.display = 'none';
    }
  }
}
