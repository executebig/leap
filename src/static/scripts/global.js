const notyf = new Notyf({
  position: {
    x: 'center',
    y: 'top'
  },
  types: [
    {
      type: 'info',
      background: '#3d6aff'
    },
    { 
      type: 'warning',
      background: '#daa000',
    },
    { 
      type: 'special',
      background: '#9E6ABC',
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
  const nextDue = new Date()
  nextDue.setDate(nextDue.getUTCDate() + ((7 - nextDue.getUTCDay()) % 7))
  nextDue.setUTCHours(0)
  nextDue.setMinutes(0)
  nextDue.setMilliseconds(0)

  return nextDue
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
