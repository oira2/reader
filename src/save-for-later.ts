import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const storageKey = 'save-for-later'
const savedPath = localStorage.getItem(storageKey)

const button = document.querySelector('#save-for-later')

if (button) {
  const { pathname } = window.location
  let isSaved = savedPath === pathname

  const updateLabel = () => {
    button.textContent = `${isSaved ? 'Unsave' : 'Save'} for Later`
  }

  updateLabel()

  button.addEventListener('click', () => {
    if (isSaved) {
      localStorage.removeItem(storageKey)
      isSaved = false
    } else {
      localStorage.setItem(storageKey, pathname)
      isSaved = true
      window.location.href = '..' 
    }

    updateLabel()
  })

  tippy(button, {
    content: 'A link to return to this chapter will be placed on the home page. Uses local browser storage.',
    placement: 'bottom',
    delay: [300, 0],
  })

  button.removeAttribute('disabled')
}

const savedContainer = document.querySelector('#saved-container')

if (savedContainer && savedPath) {
  const link = savedContainer.querySelector('#saved-container-anchor') as HTMLAnchorElement
  link.href = savedPath
  link.textContent = savedPath
  savedContainer.classList.remove('hidden')
}
