(function(document) {
  var toggle = document.querySelector('#sidebar-toggle');
  var rightToggle = document.querySelector('#right-sidebar-toggle');
  var sidebar = document.querySelector('#sidebar');
  var rightSidebar = document.querySelector('#right-sidebar');
  var checkbox = document.querySelector('#sidebar-checkbox');
  var rightCheckbox = document.querySelector('#right-sidebar-checkbox');

  document.addEventListener('click', function(e) {
    var target = e.target;

    if((!checkbox.checked && !rightCheckbox.checked) ||
       sidebar.contains(target) ||
       rightSidebar.contains(target) ||      
       target === checkbox || target === toggle || target === rightCheckbox || target === rightToggle) return;

    checkbox.checked = false;
    rightCheckbox.checked = false;
  }, false);
})(document);
