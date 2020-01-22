var showProducts = function(){
  fetch('http://localhost/pwaServices/getProducts').then(function(response){
    response.clone().json().then(function(jsonObj){      
        jsonObj.data.forEach(function(item){
            var productNode = document.createElement('div')
            var productNameNode = document.createElement('div');
            var productPriceNode = document.createElement('div');
            var productPictureNode = document.createElement('img');        
            productPictureNode.src = './images/products/' + item.id + '.png';
            productNameNode.textContent = item.name;
            productPriceNode.textContent = item.price;
            productPictureNode.className = 'productPicture'
            productNode.className = 'productContainer'
            productNode.appendChild(productNameNode);
            productNode.appendChild(productPictureNode);
            productNode.appendChild(productPriceNode);        
            document.getElementById('productsCatalog').appendChild(productNode);
            if (window.PaymentRequest) {
                var payButton = document.createElement('button');            
                productNode.appendChild(payButton);
                payButton.textContent = 'Buy'
                payButton.addEventListener('click', function() {
                    onBuyClicked(initPaymentRequest(item));
                });
            }              
        })
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