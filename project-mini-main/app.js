document.getElementById('vendorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const vendorData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value,
      mobile: document.getElementById('mobile').value,
      type: document.getElementById('type').value,
      shop: document.getElementById('shop').value
    };
  
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendorData)
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('Vendor registered successfully!');
        document.getElementById('vendorForm').reset();
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  });
  