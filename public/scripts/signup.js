const validateForm = (formData) => {
  const password = formData.get("password");
  const passwordConfirm = formData.get("password_confirm");

  if (password !== passwordConfirm) {
    alert("Passwords do not match.");
    return false;
  }
  return true;
};

const submitForm = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const isValid = validateForm(formData);
  if (!isValid) return;

  try {
    const res = await fetch(form.action, {
      method: form.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData).toString(),
    });

    if (res.status === 201) {
      window.location.href = "/chat";
    } else {
      const resBody = await res.json();
      alert(resBody.errorMessage);
    }
  } catch (err) {
    alert(err.message);
  }
};

window.addEventListener("load", () => {
  document.getElementById("form-signup").addEventListener("submit", submitForm);
});
