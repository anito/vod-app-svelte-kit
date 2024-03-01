<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Container, Heading } from '$lib/components';

  onMount(() => {});
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | Privacy Policy</title>
</svelte:head>

<Container density="sm" extended>
  <div slot="header" class="">
    <Heading mdc h="5">Privacy Policy</Heading>
  </div>
  <div class="container flex flex-col self-center">
    <h2>Eligibility / Minimum Age</h2>
    <p>
      Every age group is allowed to use the application. You shall be
      responsible to obtain necessary authority to post or retrieve any
      information and you agree to be accountable for that information.
    </p>
    <h2>Registration</h2>
    <p>
      To access certain services offered by our application, we may require that
      you create an account with us or provide personal information to complete
      the creation of an account. You are responsible for maintaining the
      confidentiality of your user identification, password, account details. We
      will only use your name and email from Facebook as a part of the
      verification and which will available for the public user to contact you
      for taking your product. You agree to accept this responsibility and
      ensure your account and its related details are maintained securely at all
      times and all necessary steps are taken to prevent misuse of your account.
    </p>
    <h2>Understanding of Platform</h2>
    <p>
      You agree, understand and acknowledge that this is an online platform that
      enables you to connect to donated product at any time from any location.
      You further agree and acknowledge that we are only a facilitator. You
      agree not to hold Daani responsible for the information posted by these
      users or for their act in any circumstances however we will constantly
      moderate the products being added. You further understand that Daani is
      not involved in the transaction of any goods/services listed in the Site.
      You will be directly contacting users who have posted advertisements
      regarding their goods or services offered.
    </p>
    <h2>No warranties</h2>
    <p>
      Daani expresses no representations or warranties, of any kind related to
      this application or the materials contained on this application. Also,
      nothing contained on this Website shall be interpreted as advising you.
    </p>
    <h2>Modification to Service</h2>
    <p>
      The Company may change, suspend, or discontinue all or any part of the
      Service at any time, with or without reason. You acknowledge that the
      operation of the Service may from time to time encounter technical or
      other problems and may not necessarily continue uninterrupted or without
      technical or other errors and The Company shall not be responsible to you
      or others for any such interruptions, errors or problems or an outright
      discontinuance of the Service.
    </p>
    <h2>Your Conduct</h2>
    <p>
      By posting or submitting any content to the application, including visual
      files, represent and warrant that You lawfully own or have rights
      including the copyright, to Your Content None of the materials included in
      Your Content are unlawful, defamatory, libelous, obscene or pornographic,
      promotes racism or hatred based on age, gender, race, religion, caste,
      class Use of Your Content will not violate any legal rights (privacy,
      intellectual property, etc) of any third party You are solely responsible
      and accountable for Your Content Moreover, you agree not to post or list
      any information: That is related to the sale of any illegal, counterfeit,
      stolen goods and/or services Containing virus, spam, pyramid schemes or
      any similar forms Related to goods / or services that are prohibited by
      laws &amp; regulation of Federal Democratic Republic of Nepal
    </p>
    <h2>Continued Availability of the site</h2>
    <p>
      We will do our utmost to ensure that access to the application is
      consistently available and is uninterrupted and error-free. However, due
      to the nature of the Internet and the nature of the Site, this cannot be
      guaranteed. Additionally, your access to the Site may also be occasionally
      suspended or restricted to allow for repairs, maintenance, or the
      introduction of new facilities or services at any time without prior
      notice. We will attempt to limit the frequency and duration of any such
      suspension or restriction.
    </p>
  </div>
</Container>

<style>
</style>
