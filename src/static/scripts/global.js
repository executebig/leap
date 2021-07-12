const notyf = new Notyf({
  position: {
    x: 'center',
    y: 'top'
  },
  types: [
    {
      type: 'info',
      background: '#3d6aff'
    }
  ]
})

// navbar
const burger = document.querySelector('.navbar-burger')
const menu = document.querySelector('.navbar-menu')

burger.addEventListener('click', () => {
  burger.classList.toggle('is-active')
  menu.classList.toggle('is-active')
})

// countdown timer
const getNextDue = () => {
  const currentUTC = new Date().getTime()
  const DAY = 1000 * 60 * 60 * 24

  return new Date(currentUTC - (currentUTC % (DAY * 7)) + DAY * 10)
}

const getTimeRemaining = (endtime) => {
  const total = Date.parse(endtime) - Date.parse(new Date())
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return {
    total,
    days,
    hours,
    minutes
  }
}

const clock = document.querySelector('.expiration_timer')

if (clock) {
  const cd_days = clock.querySelector('.days')
  const cd_hours = clock.querySelector('.hours')
  const cd_mins = clock.querySelector('.minutes')

  const refreshClock = () => {
    const t = getTimeRemaining(getNextDue())
    cd_days.innerText = t.days
    cd_hours.innerText = t.hours
    cd_mins.innerText = t.minutes

    if (t.total <= 0) {
      window.location.href = '/dash'
    } else if (t.days < 1) {
      clock.classList.remove('is-primary')
      clock.classList.add('is-danger')
    }
  }

  const initializeClock = () => {
    const timeinterval = setInterval(refreshClock, 2000)
  }

  refreshClock()
  initializeClock()
}
