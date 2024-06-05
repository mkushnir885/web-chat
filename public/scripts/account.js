const submitForm = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: form.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData).toString(),
    });

    const resBody = await res.json();
    if (res.status === 200) alert(resBody.message);
    else alert(resBody.errMessage);
  } catch (err) {
    alert(err.message);
  }
};

window.addEventListener('load', () => {
  document.getElementById('form-login').addEventListener('submit', submitForm);
});
