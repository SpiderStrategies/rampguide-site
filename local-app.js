// Local preview wiring only. Production always uses the hosted application.
(function () {
  var production = 'https://trust.rampguide.com'
  var loopback = ['localhost', '127.0.0.1', '[::1]']
  var local = loopback.includes(location.hostname)
  var selected = 'http://localhost:8790'
  var key = 'rampguide-preview-app'
  function origin(value) {
    try {
      var url = new URL(value)
      if (!['http:', 'https:'].includes(url.protocol) ||
          !loopback.includes(url.hostname) || url.username || url.password ||
          url.pathname !== '/' || url.search || url.hash) return null
      return url.origin
    } catch (_) { return null }
  }
  if (local) {
    var query = new URLSearchParams(location.search)
    var saved = null
    try { saved = sessionStorage.getItem(key) } catch (_) {}
    selected = origin(query.get('trust')) || origin(saved) || selected
    try { sessionStorage.setItem(key, selected) } catch (_) {}
  }
  window.RG_APP = local ? selected : production
  document.querySelectorAll('a[href]').forEach(function (link) {
    var url = new URL(link.href, location.href)
    if (url.origin === production) {
      // The site's Sign in link goes directly to the sign-in ceremony.
      link.href = window.RG_APP + (link.classList.contains('signin') ? '/sign-in' : url.pathname + url.search + url.hash)
    } else if (local && url.origin === location.origin &&
               (url.pathname.endsWith('/') || url.pathname.endsWith('.html'))) {
      // Carry the choice across pages and new tabs, even without browser storage.
      url.searchParams.set('trust', selected)
      link.href = url.href
    }
  })
  document.querySelectorAll('form[data-checkout]').forEach(function (form) {
    form.action = window.RG_APP + '/v1/checkout'
  })
  if (local && location.pathname.endsWith('/welcome.html')) {
    var simulated = new URLSearchParams(location.search).get('checkout') === 'simulated'
    document.querySelector('h1').textContent = simulated ? 'Your local workspace has been created.' : 'Continue in your local workspace.'
    document.querySelector('.lede').textContent = simulated
      ? 'This checkout used a simulated payment. No card was charged, no Stripe receipt was sent and the owner’s invitation was captured by the local mailer.'
      : 'This is a local preview. This page alone does not confirm payment or workspace creation. Continue after checkout has created your workspace.'
    var receipt = document.querySelector('.notice.good')
    receipt.className = 'notice'
    receipt.textContent = 'Local invitation: '
    var mail = document.createElement('a')
    mail.href = window.RG_APP + '/dev/mail'
    mail.className = 'text-link'
    mail.textContent = 'Open captured mail'
    receipt.append(mail, document.createTextNode(' to read the owner’s invitation code. Then '))
    var enroll = document.createElement('a')
    enroll.href = window.RG_APP + '/enroll'
    enroll.className = 'text-link'
    enroll.textContent = 'enroll with a passkey'
    receipt.append(enroll, document.createTextNode('.'))
    document.querySelector('.steps li').textContent = 'Read the owner’s invitation in captured local mail. It contains the one-time enrollment code; nothing was sent to the email address.'
  }
})()
