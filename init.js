var showProducts = function(){
  fetch('http://localhost/pwaServices/getProducts').then(function(response){
    response.clone().json().then(function(jsonObj){
        console.log(JSON.stringify(jsonObj));
    })
  })
}
// Krok 1: rejestrujemy nasz Service Worker
if (navigator.serviceWorker) {
    try {
      var pathname = window.location.pathname;
      navigator.serviceWorker.register(pathname + 'sw.js', {scope: window.location.href}).then(() => {
        console.log("Service Worker registered");
        showProducts();        
      }        
      ).catch(err =>
        console.log(err)
      );      
    } catch (err) {
      console.log(err);
    }
}