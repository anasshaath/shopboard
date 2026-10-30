import './style.css'

const form = document.querySelector('#registration-form')
const status = document.querySelector('#form-status')

// The browser checks required fields, email format, and password length first.
form.addEventListener('submit', (event) => {
  event.preventDefault()
  status.textContent =
    'Your form passed validation. This is a demo; no account was created or information saved.'
  form.reset()
})

form.addEventListener('input', () => {
  status.textContent = ''
})
