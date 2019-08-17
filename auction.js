// making sure the document is loaded before starting script
window.onload = function () {
    document.getElementById('startAuction').addEventListener('click', loadText);

    function loadText() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'sample.json', true);
        xhr.onload = function () {
            if (this.status == 200) {
                console.log(this.responseText);
            }
        }
        // sends req
        xhr.send();
    }
}