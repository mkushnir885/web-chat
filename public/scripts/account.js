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
    if (res.status === 202) alert(resBody.message);
    else alert(resBody.errorMessage);
    form.reset();
  } catch (err) {
    alert(err.message);
  }
};

window.addEventListener('load', () => {
  document.getElementById('form-account').addEventListener('submit', submitForm);

  const logoutBtn = document.getElementById('btn-logout');
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/logout', { method: 'DELETE' });
      const resBody = await res.json();
      if (res.status === 200) window.location.href = '/';
      else alert(resBody.errorMessage);
    } catch (err) {
      alert(err.message);
    }
  });

  const deleteBtn = document.getElementById('btn-delete');
  deleteBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/account', { method: 'DELETE' });
      const resBody = await res.json();
      if (res.status === 200) window.location.href = '/';
      else alert(resBody.errorMessage);
    } catch (err) {
      alert(err.message);
    }
  });
});

const btnChat = document.getElementById('go-to-chat');
btnChat.addEventListener('click', () => {
  window.location.href = '/chat';
});
