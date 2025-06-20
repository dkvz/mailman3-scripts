# Mailman3 scripts

Created mainly to have a script added to cron to automatically set user preferences to not receive duplicate emails.

For some reason that setting is very hard to set and mailman lacks documentation.

I'm changing it directly in the database for the mailing list given as the first argument.

Disclaimer: this is quick and dirty stuff.

## Setting up the jobs
- Copy config.example.mjs as config.mjs
- **Change permissions to only make it readable by the user running the script**
- Running the script will require changing directory to the script's working directory
- Redirect standard output (do not redirect error utput) to /dev/null to avoid getting spammed by cron

## No dup job
- The list name is the list_id field in the mailinglist table, it's a unique identifier without "@" symbols, for instance `test.somedomain.tld` for `test@somedomain.tld`
