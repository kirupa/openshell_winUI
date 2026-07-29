(function () {
  const btn = document.getElementById('say-hi');
  const msg = document.getElementById('message');
  btn.addEventListener('click', function () {
    msg.textContent = 'Hello World';
  });
})();
