# Workflow

## Development

1. Create a branch that starts with `feature/` or `/bugfix`, depending on the task. The rest of the branch name should be lowercase, kebab-case, and describe the task.
2. Do development work in this branch and test it on your local.
3. Once satisfied, merge this branch into the `staging` branch for testing (see below).


## Staging

`staging` is a branch that will never be deleted. Pushing to this branch automatically publishes to the gh-pages site for testing.

1. Switch to the `staging` branch.
2. Merge the development branch into the `staging` branch.
3. Push the `staging` branch. This step will automatically autoprefix CSS, minify all the code, and publish everything to gh-pages. (This portion happens in the GitHub cloud, under "Actions.")
4. Point your browser to the gh-pages version of this site (aka "staging") and test it.
5. If any changes need to be made, switch back to the development branch and make them there. Then repeat this process to merge them into `staging`. (Do not make development changes directly in the `staging` branch.)
6. Once satisfied, merge this branch into the `main` branch to publish to prod (see below).


## Production (main branch)

1. Switch to the `main` branch.
2. Merge the `staging` branch into the `main` branch.
3. Push the `main` branch. Once GitHub receives this push, an "Action" there will automatically publish this site to Dreamhost.
4. Point your browser to the actual website and confirm that your changes are live and that there are no errors.
5. Once satisfied, delete the development branch.
