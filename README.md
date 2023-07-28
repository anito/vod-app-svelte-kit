<img src="./images/hero.jpg" alt="banner hero immercive studio">
<img src="./images/hero_2.jpg" alt="banner hero immercive studio">

# Video On Demand Manager

*This Repo is a Proof Of Concept*

The main focus of this web application is on [session handling](https://github.com/pixelmund/svelte-kit-cookie-session) and data exchange with the [Backend API](https://github.com/anito/vod-backend).
It aims to deal with most of the main concepts of SvelteKit.

### In general this application allows you to: ###

Manage / watch videos on a per user basis.

In a real world application managment and client layer would certainly be split into two separate apps. This app does all in one presenting an extended UI to Administrators and Superusers.

Regular users can watch videos within a configured timeframe and access their internal emails.

More privileged users may manage the video library and which is the main purpose of this app - create timeslots within which clients may watch booked videos.

A _Mail Manager_ allows you to create emails using a simple _template generator_ and send those emails to other clients - mainly in order to provide easy access by providing a token generated by a built in _token generator_.

### What the app can not do: ###

Users can not (yet) apply for a video to book. This is because the idea of this app originated from the times where occupational therapist and such where forced to find a way to provide their training and exercises to local clients while offices needed to close their doors for its clients during the lock down.

[Landing Page](https://vod-app.doojoo.de)

[Access Sample Administrators Mailbox](https://vod-app.doojoo.de/login?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzNTQ5NjNmMS05YmU0LTQyZmItOGQzYi0zZjQwNmEyM2FlNjAiLCJleHAiOjE5NTYyMjU4OTJ9.zt3NtwvgehRS_QTmt8RtsbE6Wpfkp-MGbebQRV9R4BE&redirect=/users/354963f1-9be4-42fb-8d3b-3f406a23ae60%3Ftab%3Dmail%26active%3Dinboxes%26mail_id%3D6c543ac8-a992-4d98-ae6a-58c72694b9ad)

This application was originally made using [Sapper (development abandoned)](https://github.com/anito/vod-app).

_Special thanks to the creators of:_

[Svelte Material UI](https://sveltematerialui.com/) - Hunter Perrin [@SciActive](https://twitter.com/SciActive)

[Svelte Kit Cookie Session](https://github.com/pixelmund/svelte-kit-cookie-session#svelte-kit-cookie-session--) - Julian Sigmund [pixelmund](https://github.com/pixelmund)

[Svelte-i18n](https://github.com/kaisermann/svelte-i18n#svelte-i18n) - Christian Kaisermann [kaisermann](https://github.com/kaisermann)

[Threlte](https://github.com/threlte/threlte)


and the awesome Svelte Team

# Backend API Server

The [Backend API](https://github.com/anito/vod-backend) for this application runs on an Apache/PHP server. The code is created with [CakePHP](https://cakephp.org)
