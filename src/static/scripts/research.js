/** research scripts' "pretty please" */
const researchScriptsBlocked = () => {
  if (typeof plausible === 'undefined' || !plausible) {
    return true
  } else if (typeof heap === 'undefined' || heap.config.length === 0) {
    return true
  }
}

const adblockerModal = `
            <div class="modal adb_modal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title"><ion-icon name="sad-outline" size="large"></ion-icon>
                        <span>Please consider disabling adblocker!</span></p>
                    </header>
                    <section class="modal-card-body">
                        <p>
                            We know this might seem like an awkward request, but please consider disabling your adblocker.
                            In short, we want to be able to build more exciting online programs in the future, 
                            but it'll be hard for us to do that without learning more about how you participate in Tech Roulette. 
                        </p>
                        <p>
                            <strong>Execute Big is a 501(c)(3) nonprofit organization. We do not run third-party ads, and nor do 
                            we profit with your data.</strong>
                        </p>
                        <p class="mb-0">You can read more about how we store and process research data on our 
                        <a href="https://executebig.org/research/privacy?utm_source=TR_AdbModal" target="_blank" rel="noopener">Research Privacy</a> page.
                    </section>
                    <footer class="modal-card-foot">
                    <div style="width: 100%">
                        <a class="button adb_refresh is-primary">Done & Refresh!</a>
                        <a class="button adb_optout is-pulled-right">Opt-out On This Device</a>
                    </div>
                    </footer>
                </div>
            </div>
            `

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('adbOptOut') !== 'true' && researchScriptsBlocked()) {
    document.body.innerHTML += adblockerModal
    document.querySelector('.adb_modal').classList.add('is-active')
    document.querySelector('.adb_optout').addEventListener('click', () => {
      localStorage.setItem('adbOptOut', 'true')
      document.querySelector('.adb_modal').classList.remove('is-active')
    })
    document.querySelector('.adb_refresh').addEventListener('click', () => {
      window.location.reload()
    })
  }
})
