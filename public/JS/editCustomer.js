fetch("http://localhost:3000/api/customerReport?src=editCustomer")
.then(response=>response.json())
.then(data=>{

    const select = document.querySelector('#customerId');
    data.forEach(object=>{
        const option = document.createElement('option');
        option.value = object.id;
        option.textContent = `${object.name}`;
        select.appendChild(option);
    });

    select.addEventListener('change',()=>{
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input=>{input.value = '';});
        if(select.value != '--SELECT--'){
            fetch(`http://localhost:3000/api/editCustomerData?id=${select.value}`)
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                inputs[0].value = data[0].name;
                inputs[1].value = data[0].address;
                inputs[2].value = data[0].country;
                inputs[3].value = data[0].phone_number;
                inputs[4].value = data[0].office_number;
                inputs[5].value = data[0].email;
                inputs[6].value = data[0].VAT_number;
                inputs[7].value = data[0].PO_box;
                inputs[8].value = data[0].website;
                inputs[9].value = data[0].shipping_port;
                inputs[10].value = select.value;

            })
            .catch(error=>console.log(error));
        }
    });
})
.catch(error=>console.log(error));

const form = document.querySelector('#editCustomerForm');

form.addEventListener('submit',async function(event){
    event.preventDefault();
    const formData = {
        id: form.customerid.value,
        name: form.customerName.value,
        address: form.customerAddress.value,
        country: form.country.value,
        phoneNumber: form.phoneNumber.value,
        officeNumber: form.officeNumber.value,
        email: form.email.value,
        VATnumber: form.VATnumber.value,
        PObox: form.PObox.value,
        website: form.website.value,
        shippingPort: form.shippingPort.value
    };
    try{
        const response = await fetch("http://localhost:3000/editCustomer",{
          method: 'PUT',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
            const result = await response.json();
            //console.log("Response:", result);
            if(result.message)
            {
              alert('success!');
              window.location.href = '../Forms/customerForm.html';
            }
            else{
              alert('failure');
            }
        }
    }
    catch(error){
        console.error("Fetch Error:", error);
        alert("An error occurred while submitting the order.");
    }
});