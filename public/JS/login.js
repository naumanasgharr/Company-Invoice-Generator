const form = document.querySelector('#loginForm');

form.addEventListener('submit',async function (event){
    event.preventDefault();
    try {
        const formData = {
            username: form.username.value,
            password: form.password.value
        }
        const response = await fetch('http://localhost:3000/login',{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        if(!response.ok) {
            //console.log(response);
            alert('INVALID USERNAME OR PASSWORD');
        }
        else{
            window.location.href = '/main';
        }
    }
    catch(error) {
        console.log(error);
        alert(error);
    }
});