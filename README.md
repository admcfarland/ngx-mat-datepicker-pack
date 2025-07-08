[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![GitHub Tag Release](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/github-release.yml/badge.svg)](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/github-release.yml)
[![Update Changelog](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/update-changelog.yml/badge.svg)](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/update-changelog.yml)
[![Deploy GitHub Pages](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/jekyll-gh-pages.yml/badge.svg)](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/jekyll-gh-pages.yml)
[![Node.js Package](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/npm-publish.yml)
[![Stale | Close](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/stale-close.yml/badge.svg)](https://github.com/admcfarland/ngx-mat-datepicker-pack/actions/workflows/stale-close.yml)


## Getting Started

1. **Install dependencies**

   Run the following command in the `demo` directory to install all required dependencies:

   ```bash
   npm i
   ```

   This will also trigger the `prepare` script, which configures git to use the custom hooks located in the `.git-hooks` directory by setting the `core.hooksPath` property.

2. **Git commit hooks**

   The custom git hooks help enforce commit message standards and other repository rules automatically.

3. **Making commits**

   While you can manually write commit messages, it is highly recommended to use this script:

   ```bash
   npm run add-cz
   ```

   This will add all changed files and then guide you through a series of questions to help you compose a properly formatted commit message. This tool can only be access while within the same directory as the `package.json` file.

4. **Commit message requirements**

   The repository enforces a strict commit message policy via `commitlint`. Every commit message **must include a reference** (such as an issue number or identifier, e.g. `#` or `issue-`). This is mandatory and enforced by the configuration—neither manual commits nor the interactive commit tool (`npm run commit`) can bypass this requirement.

   If your commit message does not include a reference, the commit will be rejected.
